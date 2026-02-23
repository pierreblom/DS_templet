/**
 * JWT Authentication Middleware
 * Following xneelo security guidelines
 */
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../../utils/errors');
const { User } = require('../../database/index');

const getJwtSecret = () => process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';
const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_for_development';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate access and refresh tokens
 */
function generateTokens(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign({ userId: user.id }, getJwtRefreshSecret(), {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
}

/**
 * Verify JWT access token
 */
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch (_error) {
        return null;
    }
}

/**
 * Verify JWT refresh token
 */
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, getJwtRefreshSecret());
    } catch (_error) {
        return null;
    }
}

/**
 * Authentication middleware - requires valid JWT
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            throw new AuthenticationError('Invalid or expired token');
        }

        if (decoded.userId === 'admin-user-id') {
            req.user = {
                id: 'admin-user-id',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin'
            };
            req.userId = 'admin-user-id';
            return next();
        }

        // Fetch user from database to ensure they still exist
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'email', 'first_name', 'last_name']
        });

        if (!user) {
            throw new AuthenticationError('User not found');
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Optional authentication - attaches user if token present but doesn't fail
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            if (decoded) {
                if (decoded.userId === 'admin-user-id') {
                    req.user = {
                        id: 'admin-user-id',
                        email: process.env.ADMIN_EMAIL,
                        name: 'Admin',
                        role: 'admin'
                    };
                    req.userId = 'admin-user-id';
                } else {
                    const user = await User.findByPk(decoded.userId, {
                        attributes: ['id', 'email', 'first_name', 'last_name']
                    });

                    if (user) {
                        req.user = user;
                        req.userId = user.id;
                    }
                }
            }
        }

        next();
    } catch (_error) {
        // Don't fail on optional auth, just continue without user
        next();
    }
}

module.exports = {
    authenticate,
    optionalAuth,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
};
