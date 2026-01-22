const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'js', 'app.log');

console.log('\x1b[36m%s\x1b[0m', '--- Beha Log Viewer (Tailing app.log) ---');
console.log('\x1b[90m%s\x1b[0m', 'Press Ctrl+C to stop\n');

if (!fs.existsSync(LOG_FILE)) {
    console.log('\x1b[33m%s\x1b[0m', 'Log file does not exist yet. Waiting for logs...');
    // Create empty file to watch
    fs.writeFileSync(LOG_FILE, '');
}

function formatLog(line) {
    try {
        const log = JSON.parse(line);
        const colors = {
            reset: "\x1b[0m",
            INFO: "\x1b[32m",
            WARN: "\x1b[33m",
            ERROR: "\x1b[31m",
            timestamp: "\x1b[90m"
        };
        const color = colors[log.level] || colors.reset;
        return `${colors.timestamp}[${log.timestamp}]${colors.reset} ${color}${log.level}:${colors.reset} ${log.message}`;
    } catch (e) {
        return line;
    }
}

// Read existing logs
const initialContent = fs.readFileSync(LOG_FILE, 'utf8').trim();
if (initialContent) {
    initialContent.split('\n').forEach(line => {
        if (line) console.log(formatLog(line));
    });
}

// Watch for changes
let fileSize = fs.statSync(LOG_FILE).size;
fs.watchFile(LOG_FILE, { interval: 500 }, (curr, prev) => {
    if (curr.size > prev.size) {
        const stream = fs.createReadStream(LOG_FILE, {
            start: prev.size,
            end: curr.size
        });
        stream.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            lines.forEach(line => {
                if (line) console.log(formatLog(line));
            });
        });
    } else if (curr.size < prev.size) {
        console.log('\x1b[33m%s\x1b[0m', '\n--- Log file cleared ---\n');
    }
});
