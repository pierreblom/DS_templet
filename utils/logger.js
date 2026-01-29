/**
 * Structured JSON logging utility
 * Following xneelo logging guidelines with required fields
 */
const { v4: uuidv4 } = require('uuid');

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;

/**
 * Generate a new trace ID for distributed tracing
 */
function generateTraceId() {
    return uuidv4();
}

/**
 * Create a structured log entry with required fields
 */
function createLogEntry(level, message, meta = {}) {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        traceId: meta.traceId || null,
        sourceIp: meta.sourceIp || null,
        user: meta.user || null,
        endpoint: meta.endpoint || null,
        action: meta.action || null,
        params: meta.params || null,
        ...meta.extra
    };
}

/**
 * Output log entry as JSON
 */
function outputLog(entry) {
    // Remove null values for cleaner logs
    const cleanEntry = Object.fromEntries(Object.entries(entry).filter(([, v]) => v != null));
    console.log(JSON.stringify(cleanEntry));
}

const logger = {
    error(message, meta = {}) {
        if (currentLevel >= LOG_LEVELS.error) {
            outputLog(createLogEntry('error', message, meta));
        }
    },

    warn(message, meta = {}) {
        if (currentLevel >= LOG_LEVELS.warn) {
            outputLog(createLogEntry('warn', message, meta));
        }
    },

    info(message, meta = {}) {
        if (currentLevel >= LOG_LEVELS.info) {
            outputLog(createLogEntry('info', message, meta));
        }
    },

    debug(message, meta = {}) {
        if (currentLevel >= LOG_LEVELS.debug) {
            outputLog(createLogEntry('debug', message, meta));
        }
    },

    /**
     * Create a child logger with preset context
     */
    child(defaultMeta) {
        return {
            error: (msg, meta = {}) => logger.error(msg, { ...defaultMeta, ...meta }),
            warn: (msg, meta = {}) => logger.warn(msg, { ...defaultMeta, ...meta }),
            info: (msg, meta = {}) => logger.info(msg, { ...defaultMeta, ...meta }),
            debug: (msg, meta = {}) => logger.debug(msg, { ...defaultMeta, ...meta })
        };
    }
};

module.exports = {
    logger,
    generateTraceId
};
