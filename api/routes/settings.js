const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../../utils/logger');

const SETTINGS_FILE_PATH = path.join(__dirname, '../../config/settings.json');

// GET /api/v1/settings
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf8');
        const settings = JSON.parse(data);
        res.json({ success: true, settings });
    } catch (error) {
        logger.error('Failed to read settings', { error: error.message });
        res.status(500).json({ success: false, error: 'Failed to load settings' });
    }
});

// PUT /api/v1/settings
router.put('/', authenticate, async (req, res) => {
    try {
        const newSettings = req.body;

        // Ensure the config directory exists
        const configDir = path.dirname(SETTINGS_FILE_PATH);
        await fs.mkdir(configDir, { recursive: true });

        // Save settings.json
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), 'utf8');

        // Update EJS app.locals if accessible (it might be better to re-read it in server.js or attach it to app.locals here if we can)
        // Since we are inside a router, we can access app via req.app
        if (req.app && req.app.locals) {
            req.app.locals.siteSettings = newSettings;
        }

        res.json({ success: true, settings: newSettings });
    } catch (error) {
        logger.error('Failed to update settings', { error: error.message });
        res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
});

module.exports = router;
