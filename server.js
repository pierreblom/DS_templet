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
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load initial settings
const SETTINGS_FILE_PATH = path.join(__dirname, 'config/settings.json');
try {
    const rawSettings = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
    app.locals.siteSettings = JSON.parse(rawSettings);
} catch (err) {
    logger.error('Failed to load initial site settings', { extra: err.message });
    app.locals.siteSettings = {
        theme: {
            primaryColor: "#C88E75",
            secondaryColor: "#A0522D",
            typography: { fontFamily: "Outfit, sans-serif", headingFontFamily: "Playfair Display, serif" },
            shapes: { borderRadius: "8px" },
            spacing: { globalPadding: "2rem", globalMargin: "1rem" }
        },
        layout: {
            heroEnabled: true, customerLoveEnabled: true, trailFavoritesEnabled: true,
            newArrivalsEnabled: true, valuePropsEnabled: true, newsletterEnabled: true
        },
        content: {
            hero: { title: "Celebrate Every Body", subtitle: "Discover our inclusive and stylish collection.", ctaText: "SHOP NOW", ctaLink: "/select.html" },
            newArrivals: { title: "New Arrivals!", subtitle: "Discover our latest designs that celebrate every body.", promoText: "Claim 15% off if you buy 2 or more items!" }
        },
        navigation: {
            headerLinks: [{ label: "Home", url: "/" }, { label: "Shop", url: "/select.html" }],
            footerLinks: [{ label: "Terms and Conditions", url: "/legal/terms-and-conditions.html" }]
        },
        media: { logo: "/images/logo.png", favicon: "/favicon.ico", heroBackground: "/images/hero-bg.jpg" },
        branding: { websiteTitle: "shopbeha.com - The Most Comfortable Bra" },
        contact: { email: "hello@shopbeha.com" }
    };
}

// ===================
// Security Middleware
// ===================

// Helmet for security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'", // Often needed for development tools
                    "https://cdn.jsdelivr.net",
                    "https://js.yoco.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com"
                ],
                imgSrc: ["'self'", "data:", "https:", "blob:", "http:"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                connectSrc: [
                    "'self'",
                    "https://*.supabase.co",
                    "https://*.yoco.com",
                    "http://localhost:*",
                    "https://fonts.googleapis.com",
                    "https://fonts.gstatic.com",
                    "https://cdn.jsdelivr.net",
                    "https://upload.wikimedia.org"
                ],
                scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
                frameSrc: ["'self'", "https://js.yoco.com"],
                objectSrc: ["'none'"],
                // upgradeInsecureRequests: [], // Removed to fix localhost issues
            },
        },
        crossOriginEmbedderPolicy: false
    })
);

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    const localOrigins = [
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ];

    localOrigins.forEach(origin => {
        if (!allowedOrigins.includes(origin)) {
            allowedOrigins.push(origin);
        }
    });
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
// Page Routes (Must be before static files to enable EJS rendering)
// ===================

// Contact page routes
app.get('/contact', (req, res) => {
    res.render('contact.html');
});
app.get('/contact.html', (req, res) => {
    res.render('contact.html');
});

// Orders page routes
app.get('/orders', (req, res) => {
    res.render('orders.html');
});
app.get('/orders.html', (req, res) => {
    res.render('orders.html');
});

// Profile page routes
app.get('/profile', (req, res) => {
    res.render('profile.html');
});
app.get('/profile.html', (req, res) => {
    res.render('profile.html');
});

// Checkout page routes
app.get('/checkout', (req, res) => {
    res.render('checkout.html');
});
app.get('/checkout.html', (req, res) => {
    res.render('checkout.html');
});

app.get('/success', (req, res) => {
    res.redirect('/orders');
});

app.get('/legal/:page', (req, res) => {
    // Prevent directory traversal
    const safePage = path.basename(req.params.page);
    res.render(path.join(__dirname, 'legal', safePage));
});

app.get('/legal', (req, res) => {
    res.redirect('/legal/terms-and-conditions.html');
});

// ===================
// Static Files
// ===================

// Serve admin dashboard (after build)
app.use('/admin', express.static(path.join(__dirname, 'admin', 'dist')));

// Admin SPA - catch all admin routes
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dist', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'home_page')));
app.use(express.static(path.join(__dirname)));

// ===================
// API Routes v1
// ===================

const authRoutes = require('./api/routes/auth');
const productRoutes = require('./api/routes/products');
const yocoRoutes = require('./api/routes/yoco');
const promosRoutes = require('./api/routes/promos');

const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const analyticsRoutes = require('./api/routes/analytics');
const webhookRoutes = require('./api/routes/webhooks');
const contactRoutes = require('./api/routes/contact');
const settingsRoutes = require('./api/routes/settings');
const uploadRoutes = require('./api/routes/upload');

// Apply stricter rate limit to auth routes
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Webhook routes need raw body - mount before JSON parsing
// Note: This is handled in the webhook route file with express.raw()

// Mount API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/promos', promosRoutes);

app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/yoco', yocoRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/upload', uploadRoutes);

const subscriptionRoutes = require('./api/routes/subscriptions');
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Legacy routes (for backward compatibility during transition)
app.use('/api/products', productRoutes);


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
            try {
                // Using alter: false to prevent aggressive schema changes which might cause crashes
                // with existing Supabase tables.
                await sequelize.sync({ alter: false });
                logger.info('Database models synchronized (no alter)');
            } catch (err) {
                logger.error('Database sync failed', { extra: err.message });
                // Continue anyway, as the DB might be fine
            }
        }

        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`, {
                extra: {
                    port: PORT,
                    environment: process.env.NODE_ENV || 'development'
                }
            });
        });

        server.on('close', () => {
            logger.info('Server connection closed');
        });

        // Debug: keep event loop alive manually
        setInterval(() => {
            logger.debug('Event loop interval tick');
        }, 1000 * 60);
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
