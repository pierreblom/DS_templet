require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./database/index');
const { logger } = require('./utils/logger');
const { traceIdMiddleware } = require('./api/middleware/traceId');
const { errorHandler, notFoundHandler } = require('./api/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================
// Security Middleware
// ===================

// Helmet for security headers
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    })
);

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
}
if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://127.0.0.1:3000')) {
    allowedOrigins.push('http://127.0.0.1:3000');
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id']
    })
);

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply general rate limit to all requests
app.use(generalLimiter);

// ===================
// Core Middleware
// ===================

// Trace ID for distributed tracing
app.use(traceIdMiddleware);

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // JSON logging for production
    app.use(
        morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        })
    );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP detection (important for Vercel)
app.set('trust proxy', 1);

// ===================
// View Engine
// ===================

app.set('views', path.join(__dirname, 'home_page'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// ===================
// Static Files
// ===================

// Serve admin dashboard (after build)
app.use('/admin', express.static(path.join(__dirname, 'admin', 'dist')));

// Admin SPA - catch all admin routes
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dist', 'index.html'));
});

app.use(express.static(path.join(__dirname)));

// ===================
// API Routes v1
// ===================

const authRoutes = require('./api/routes/auth');
const productRoutes = require('./api/routes/products');
const yocoRoutes = require('./api/routes/yoco');
const checkoutRoutes = require('./api/routes/checkout');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const analyticsRoutes = require('./api/routes/analytics');
const webhookRoutes = require('./api/routes/webhooks');
const contactRoutes = require('./api/routes/contact');

// Apply stricter rate limit to auth routes
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Webhook routes need raw body - mount before JSON parsing
// Note: This is handled in the webhook route file with express.raw()

// Mount API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/webhooks', webhookRoutes);

// Legacy routes (for backward compatibility during transition)
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);

// ===================
// Health Check
// ===================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        version: 'v1',
        timestamp: new Date().toISOString()
    });
});

// ===================
// Frontend Routes
// ===================

app.get('/log', (req, res) => {
    const message = req.query.msg;
    if (message) {
        logger.debug('Frontend log', {
            traceId: req.traceId,
            extra: { message: decodeURIComponent(message) }
        });
    }
    res.sendStatus(200);
});

app.get('/favicon.ico', (req, res) => {
    res.set('Content-Type', 'image/svg+xml');
    res.send(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">&#x1F33F;</text></svg>'
    );
});

// Main page
app.get('/', (req, res) => {
    res.render('front_page.html');
});

// Admin SPA - catch all admin routes
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dist', 'index.html'));
});

// ===================
// Error Handling
// ===================

// 404 handler for API routes
app.use('/api', notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===================
// Server Start
// ===================

async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync models in development (creates tables if they don't exist)
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            logger.info('Database models synchronized');
        }

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`, {
                extra: {
                    port: PORT,
                    environment: process.env.NODE_ENV || 'development'
                }
            });
        });
    } catch (error) {
        logger.error('Unable to start server', {
            extra: { error: error.message, stack: error.stack }
        });
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, _promise) => {
    logger.error('Unhandled Rejection', {
        extra: { reason: reason?.message || reason }
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        extra: { error: error.message, stack: error.stack }
    });
    process.exit(1);
});

if (require.main === module) {
    startServer();
}

// Export for Vercel serverless
module.exports = app;
