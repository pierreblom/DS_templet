/**
 * Centralized Error Handler
 * Following xneelo security guidelines - never expose stack traces
 */
const { logger } = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, _next) {
    // Get trace ID from request or generate one
    const traceId = req.traceId || 'unknown';

    // Log detailed error server-side
    logger.error(err.message, {
        traceId,
        sourceIp: req.ip,
        user: req.user?.email || null,
        endpoint: `${req.method} ${req.originalUrl}`,
        extra: {
            stack: err.stack,
            code: err.code,
            statusCode: err.statusCode
        }
    });

    // Handle known operational errors
    if (err instanceof AppError) {
        const response = {
            error: {
                code: err.code,
                message: err.message
            }
        };

        // Add validation details if present
        if (err.details && err.details.length > 0) {
            response.error.details = err.details;
        }

        // Add stock info for insufficient stock errors
        if (err.code === 'INSUFFICIENT_STOCK') {
            response.error.productId = err.productId;
            response.error.productName = err.productName;
            response.error.availableStock = err.availableStock;
            response.error.requestedQuantity = err.requestedQuantity;
        }

        return res.status(err.statusCode).json(response);
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const details = err.errors.map((e) => ({
            field: e.path,
            message: e.message
        }));

        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details
            }
        });
    }

    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: {
                code: 'CONFLICT',
                message: 'Resource already exists'
            }
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Invalid or expired token'
            }
        });
    }

    // For unknown errors, return generic message (never expose stack traces)
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An error has occurred'
        }
    });
}

/**
 * Handle 404 for unknown routes
 */
function notFoundHandler(req, res, _next) {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
        }
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
