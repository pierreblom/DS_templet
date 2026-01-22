const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'app.log');

function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...context
    };

    const logString = JSON.stringify(logEntry) + '\n';

    // Colors for terminal
    const colors = {
        reset: "\x1b[0m",
        info: "\x1b[32m",  // Green
        warn: "\x1b[33m",  // Yellow
        error: "\x1b[31m", // Red
        timestamp: "\x1b[90m" // Gray
    };

    const color = colors[level.toLowerCase()] || colors.reset;
    const terminalMsg = `${colors.timestamp}[${timestamp}]${colors.reset} ${color}${level}:${colors.reset} ${message}`;

    // Log to console
    if (level === 'ERROR') {
        console.error(terminalMsg, Object.keys(context).length ? context : '');
    } else {
        console.log(terminalMsg);
    }

    // Log to file
    fs.appendFile(LOG_FILE, logString, (err) => {
        if (err) console.error('Failed to write to log file', err);
    });
}

module.exports = {
    info: (msg, ctx) => log('INFO', msg, ctx),
    warn: (msg, ctx) => log('WARN', msg, ctx),
    error: (msg, ctx) => log('ERROR', msg, ctx),
    getLogs: () => {
        if (!fs.existsSync(LOG_FILE)) return [];
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        return content.trim().split('\n').map(line => JSON.parse(line));
    },
    clearLogs: () => {
        if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    }
};
