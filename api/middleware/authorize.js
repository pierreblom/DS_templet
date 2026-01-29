/**
 * Role-based Authorization Middleware
 * Following xneelo security guidelines
 */
const { AuthorizationError } = require('../../utils/errors');

/**
 * Authorize based on user roles
 * @param  {...string} allowedRoles - Roles that are allowed access
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            // Return 404 to prevent enumeration (per security guidelines)
            return next(new AuthorizationError());
        }

        if (!allowedRoles.includes(req.user.role)) {
            // Return 404 to prevent enumeration (per security guidelines)
            return next(new AuthorizationError());
        }

        next();
    };
}

/**
 * Check if user is admin
 */
function isAdmin(req, res, next) {
    return authorize('admin')(req, res, next);
}

/**
 * Check if user is the owner of a resource or an admin
 * @param {Function} getOwnerId - Function that extracts owner ID from request
 */
function isOwnerOrAdmin(getOwnerId) {
    return async (req, res, next) => {
        if (!req.user) {
            return next(new AuthorizationError());
        }

        // Admins can access anything
        if (req.user.role === 'admin') {
            return next();
        }

        try {
            const ownerId = await getOwnerId(req);

            if (ownerId !== req.user.id) {
                // Return 404 to prevent enumeration
                return next(new AuthorizationError());
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    authorize,
    isAdmin,
    isOwnerOrAdmin
};
