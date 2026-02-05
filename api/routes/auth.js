/**
 * Authentication Routes
 * Following xneelo security guidelines
 */
const express = require('express');
const router = express.Router();
const { User } = require('../../database/index');
const { authenticate } = require('../middleware/auth');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    changePasswordSchema
} = require('../validators/auth.validator');
const { AuthenticationError, ConflictError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

/**
 * POST /api/v1/auth/register
 * Create a new user account
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictError('An account with this email already exists');
        }

        // Create user (password hashing handled by model hook)
        const user = await User.create({
            email,
            password,
            name,
            role: 'customer'
        });

        // Generate tokens
        const tokens = generateTokens(user);

        logger.info('User registered', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: email,
            action: 'register'
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            ...tokens
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return tokens
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Admin Login Bypass
        if (email === process.env.ADMIN_EMAIL) {
            const adminPassword = process.env.ADMIN_PASSWORD;
            // Compare plaintext for env config (or you could hash it if you stored hash in env)
            if (password === adminPassword) {
                const adminUser = {
                    id: 'admin-user-id',
                    email: email,
                    name: 'Admin',
                    role: 'admin'
                };

                const tokens = generateTokens(adminUser);

                logger.info('Admin logged in via env credentials', {
                    traceId: req.traceId,
                    sourceIp: req.ip,
                    user: email,
                    action: 'login'
                });

                return res.json({
                    user: adminUser,
                    ...tokens
                });
            }
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });

        // Use same error message for non-existent user and wrong password
        // to prevent user enumeration (per security guidelines)
        if (!user) {
            throw new AuthenticationError('Invalid email or password');
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            throw new AuthenticationError('Invalid email or password');
        }

        // Generate tokens
        const tokens = generateTokens(user);

        logger.info('User logged in', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: email,
            action: 'login'
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            ...tokens
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validate(refreshTokenSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        if (decoded.userId === 'admin-user-id') {
            const adminUser = {
                id: 'admin-user-id',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin'
            };
            const tokens = generateTokens(adminUser);
            return res.json(tokens);
        }

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            throw new AuthenticationError('User not found');
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        logger.info('Token refreshed', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: user.email,
            action: 'refresh_token'
        });

        res.json(tokens);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/auth/me
 * Update current user's profile
 */
router.put('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (email && email !== req.user.email) {
            // Check if new email is already taken
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new ConflictError('An account with this email already exists');
            }
            updates.email = email;
        }

        await req.user.update(updates);

        logger.info('User profile updated', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: req.user.email,
            action: 'update_profile',
            params: { fields: Object.keys(updates) }
        });

        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/auth/me/password
 * Change current user's password
 */
router.put('/me/password', authenticate, validate(changePasswordSchema), async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const user = await User.findByPk(req.user.id);
        const isValid = await user.validatePassword(currentPassword);
        if (!isValid) {
            throw new AuthenticationError('Current password is incorrect');
        }

        // Update password (hashing handled by model hook)
        await user.update({ password: newPassword });

        logger.info('User password changed', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: req.user.email,
            action: 'change_password'
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client should discard tokens)
 */
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        logger.info('User logged out', {
            traceId: req.traceId,
            sourceIp: req.ip,
            user: req.user.email,
            action: 'logout'
        });

        // JWT is stateless, so we just acknowledge the logout
        // Client should discard tokens
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
