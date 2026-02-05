/**
 * User Routes
 * Customer: Profile management
 * Admin: User management
 */
const express = require('express');
const router = express.Router();
const { User, Order } = require('../../database/index');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/auth.validator');
const { NotFoundError } = require('../../utils/errors');
const { Op } = require('sequelize');

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'name', 'role', 'createdAt']
        });

        // Get order count
        const orderCount = await Order.count({
            where: { UserId: req.user.id }
        });

        res.json({
            ...user.toJSON(),
            orderCount
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/users/me
 * Update current user profile
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
                return res.status(409).json({
                    error: {
                        code: 'CONFLICT',
                        message: 'An account with this email already exists'
                    }
                });
            }
            updates.email = email;
        }

        await req.user.update(updates);

        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
router.get('/', authenticate, isAdmin, async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const where = {};

        if (search) {
            where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: ['id', 'email', 'first_name', 'last_name', 'updated_at'],
            order: [['updated_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // Get order stats for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const orderCount = await Order.count({
                    where: { user_id: user.id }
                });

                const totalSpent = await Order.sum('total_amount', {
                    where: {
                        user_id: user.id,
                        status: { [Op.in]: ['paid', 'shipped', 'delivered'] }
                    }
                }) || 0;

                return {
                    ...user.toJSON(),
                    orderCount,
                    totalSpent,
                    createdAt: user.updated_at // Using updated_at as createdAt for compatibility
                };
            })
        );

        res.json({
            users: usersWithStats,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/users/:id
 * Get user by ID (admin only)
 */
router.get('/:id', authenticate, isAdmin, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'email', 'name', 'role', 'createdAt']
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Get order stats
        const orders = await Order.findAll({
            where: { UserId: user.id },
            attributes: ['id', 'total_amount', 'status', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        const totalSpent = await Order.sum('total_amount', {
            where: {
                UserId: user.id,
                status: { [Op.in]: ['paid', 'shipped', 'delivered'] }
            }
        });

        res.json({
            ...user.toJSON(),
            totalSpent: totalSpent || 0,
            recentOrders: orders
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/users/:id/role
 * Update user role (admin only)
 */
router.patch('/:id/role', authenticate, isAdmin, async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['admin', 'customer'].includes(role)) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Role must be either admin or customer'
                }
            });
        }

        // Prevent demoting yourself
        if (req.params.id === String(req.user.id) && role !== 'admin') {
            return res.status(400).json({
                error: {
                    code: 'INVALID_OPERATION',
                    message: 'You cannot demote yourself'
                }
            });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.update({ role });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
