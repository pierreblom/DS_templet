/**
 * Audit Logger Middleware
 * Following xneelo auditing guidelines - logs all CUD operations
 */
const AuditLog = require('../../database/models/AuditLog');
const { logger } = require('../../utils/logger');

/**
 * Create an audit log entry
 */
async function createAuditEntry({
    traceId,
    sourceIp,
    userId,
    userEmail,
    endpoint,
    method,
    action,
    entityType,
    entityId,
    params,
    previousState,
    newState
}) {
    try {
        await AuditLog.create({
            traceId,
            sourceIp,
            userId,
            userEmail,
            endpoint,
            method,
            action,
            entityType,
            entityId,
            params,
            previousState,
            newState
        });
    } catch (error) {
        // Log but don't fail the request if audit logging fails
        logger.error('Failed to create audit log entry', {
            traceId,
            extra: { error: error.message }
        });
    }
}

/**
 * Extract common audit data from request
 */
function getAuditContext(req) {
    return {
        traceId: req.traceId,
        sourceIp: req.ip,
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        endpoint: req.originalUrl,
        method: req.method
    };
}

/**
 * Log a create action
 */
async function logCreate(req, entityType, entityId, newState) {
    await createAuditEntry({
        ...getAuditContext(req),
        action: 'create',
        entityType,
        entityId: String(entityId),
        params: sanitizeParams(req.body),
        newState: sanitizeState(newState)
    });
}

/**
 * Log an update action
 */
async function logUpdate(req, entityType, entityId, previousState, newState) {
    await createAuditEntry({
        ...getAuditContext(req),
        action: 'update',
        entityType,
        entityId: String(entityId),
        params: sanitizeParams(req.body),
        previousState: sanitizeState(previousState),
        newState: sanitizeState(newState)
    });
}

/**
 * Log a delete action
 */
async function logDelete(req, entityType, entityId, previousState) {
    await createAuditEntry({
        ...getAuditContext(req),
        action: 'delete',
        entityType,
        entityId: String(entityId),
        previousState: sanitizeState(previousState)
    });
}

/**
 * Sanitize parameters - remove sensitive data
 */
function sanitizeParams(params) {
    if (!params) return null;

    const sanitized = { ...params };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'refreshToken'];
    sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
}

/**
 * Sanitize state - remove sensitive data and convert to plain object
 */
function sanitizeState(state) {
    if (!state) return null;

    // Convert Sequelize instance to plain object
    const plain = state.toJSON ? state.toJSON() : { ...state };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash'];
    sensitiveFields.forEach((field) => {
        if (plain[field]) {
            delete plain[field];
        }
    });

    return plain;
}

module.exports = {
    createAuditEntry,
    logCreate,
    logUpdate,
    logDelete
};
