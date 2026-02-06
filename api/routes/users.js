/**
 * User Routes
 * Customer: Profile management
 * Admin: User management
 */
const express = require('express');
const router = express.Router();
const { User, Order, sequelize } = require('../../database/index');
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
            attributes: ['id', 'email', 'first_name', 'last_name', 'updated_at']
        });

        // Get order count
        const orderCount = await Order.count({
            where: { UserId: req.user.id }
        });

        const userData = user.toJSON();
        userData.name = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
        userData.role = 'customer'; // Default role

        res.json({
            ...userData,
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
        const offset = (page - 1) * limit;
        const searchTerm = search ? `%${search}%` : null;

        // Base query for Profiles
        let profileQuery = `
            SELECT 
                id, 
                email, 
                first_name, 
                last_name, 
                updated_at, 
                'customer' as user_type,
                'customer' as role
            FROM profiles 
            WHERE 1=1
        `;

        // Base query for Guest Customers
        let guestQuery = `
            SELECT 
                id, 
                email, 
                first_name, 
                last_name, 
                updated_at, 
                'guest' as user_type,
                'customer' as role
            FROM guest_customers 
            WHERE 1=1
        `;

        const replacements = {};

        // Apply search filter
        if (search) {
            const searchCondition = ` AND (
                email ILIKE :search 
                OR first_name ILIKE :search 
                OR last_name ILIKE :search
            )`;
            profileQuery += searchCondition;
            guestQuery += searchCondition;
            replacements.search = searchTerm;
        }

        // Apply role filter (if 'guest', only query guests; if 'admin'/'customer', only query profiles)
        // note: 'customer' role in profiles table means registered customer. 'guest' is a derived type.
        let unionQuery = '';

        if (role === 'guest') {
            unionQuery = guestQuery;
        } else if (role === 'customer') {
            // For customer role we basically want everything (profiles + guests) or just profiles?
            // Since filtering by actual column 'role' is impossible, we can just return all profiles.
            unionQuery = profileQuery;
        } else if (role === 'admin') {
            // No admins in profiles table for now, return valid empty structure
            // Or just minimal empty select
            unionQuery = `SELECT * FROM (${profileQuery}) AS p WHERE 1=0`;
        } else {
            // No specific role filter -> UNION ALL
            unionQuery = `${profileQuery} UNION ALL ${guestQuery}`;
        }

        // Final query with pagination
        const validLimit = parseInt(limit) || 20;
        const validOffset = parseInt(offset) || 0;

        const finalQuery = `
            SELECT * FROM (${unionQuery}) AS combined_users
            ORDER BY updated_at DESC
            LIMIT :limit OFFSET :offset
        `;

        replacements.limit = validLimit;
        replacements.offset = validOffset;

        // Execute query for data
        const users = await sequelize.query(finalQuery, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Execute query for count (remove LIMIT/OFFSET)
        const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) AS combined_users`;
        const countResult = await sequelize.query(countQuery, {
            replacements: { ...replacements, limit: null, offset: null },
            type: sequelize.QueryTypes.SELECT
        });

        const totalCount = parseInt(countResult[0]?.total || 0);

        // Get order stats for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const whereClause = {
                    status: { [Op.in]: ['paid', 'shipped', 'delivered'] }
                };

                const countWhereClause = {};

                if (user.user_type === 'guest') {
                    whereClause.guest_id = user.id;
                    countWhereClause.guest_id = user.id;
                } else {
                    whereClause.user_id = user.id;
                    countWhereClause.user_id = user.id;
                }

                const orderCount = await Order.count({
                    where: countWhereClause
                });

                const totalSpent = await Order.sum('total_amount', {
                    where: whereClause
                }) || 0;

                // Format name
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');

                return {
                    id: user.id,
                    email: user.email,
                    name: fullName || user.email, // Fallback to email if no name
                    role: user.role, // This comes from DB for profiles, or static 'customer' for guests
                    user_type: user.user_type, // 'customer' or 'guest'
                    createdAt: user.updated_at,
                    orderCount,
                    totalSpent
                };
            })
        );

        res.json({
            users: usersWithStats,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: validLimit,
                totalPages: Math.ceil(totalCount / validLimit)
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
            attributes: ['id', 'email', 'first_name', 'last_name', 'updated_at']
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
