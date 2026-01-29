/**
 * Trace ID Middleware
 * Adds a unique trace ID to each request for distributed tracing
 */
const { generateTraceId } = require('../../utils/logger');

function traceIdMiddleware(req, res, next) {
    // Use existing trace ID from header or generate new one
    req.traceId = req.headers['x-trace-id'] || generateTraceId();

    // Add to response headers for client debugging
    res.setHeader('X-Trace-Id', req.traceId);

    next();
}

module.exports = { traceIdMiddleware };
