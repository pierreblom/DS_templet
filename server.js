require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./database/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with inline scripts/images for now
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure EJS as the view engine for .html files
app.set('views', path.join(__dirname, 'home_page'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
const productRoutes = require('./api/routes/products');
const yocoRoutes = require('./api/routes/yoco');

app.use('/api/products', productRoutes);
app.use('/api/yoco', yocoRoutes);

// Serve the main page
app.get('/log', (req, res) => {
    const message = req.query.msg;
    if (message) {
        console.log(`Frontend Log: ${decodeURIComponent(message)}`);
    }
    res.sendStatus(200);
});

app.get('/favicon.ico', (req, res) => {
    res.set('Content-Type', 'image/svg+xml');
    res.send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">&#x1F33F;</text></svg>');
});

app.get('/', (req, res) => {
    res.render('front_page.html');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Database Sync and Server Start
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync models (force: false means it won't drop tables if they exist)
        // await sequelize.sync({ force: false }); 

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();
