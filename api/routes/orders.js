/**
 * Order Routes
 * Customer: Create, List own, Get own, Cancel own
 * Admin: List all, Update status
 */
const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User } = require('../../database/index');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isOwnerOrAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
    createOrderSchema,
    updateOrderStatusSchema,
    getOrderSchema,
    listOrdersSchema
} = require('../validators/order.validator');
const { logCreate, logUpdate } = require('../middleware/auditLogger');
const orderService = require('../services/order.service');
const { NotFoundError, AppError } = require('../../utils/errors');
const {
    sendShippingNotification,
    sendDeliveryConfirmation
} = require('../../services/emailService');
const { logger } = require('../../utils/logger');

/**
 * POST /api/v1/orders
 * Create new order (authenticated)
 */
router.post('/', authenticate, validate(createOrderSchema), async (req, res, next) => {
    try {
        const { items, shippingAddress } = req.body;

        const result = await orderService.createOrder({
            userId: req.user.id,
            items,
            shippingAddress
        });

        // Audit log
        await logCreate(req, 'Order', result.order.id, result.order);

        res.status(201).json({
            order: result.order,
            items: result.items
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/orders
 * List orders (own for customer, all for admin)
 */
router.get('/', authenticate, validate(listOrdersSchema), async (req, res, next) => {
    try {
        const {
            status,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const where = {};

        // Customers can only see their own orders
        if (req.user.role !== 'admin') {
            where.UserId = req.user.id;
        }

        if (status) {
            where.status = status;
        }

        if (startDate) {
            where.created_at = { ...where.created_at, [Op.gte]: new Date(startDate) };
        }

        if (endDate) {
            where.created_at = { ...where.created_at, [Op.lte]: new Date(endDate) };
        }

        const offset = (page - 1) * limit;

        // Map sortBy to actual column names
        const sortColumn = sortBy === 'createdAt' ? 'created_at' : sortBy;

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image_url']
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [[sortColumn, sortOrder.toUpperCase()]],
            limit,
            offset,
            distinct: true
        });

        res.json({
            orders,
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
 * GET /api/v1/orders/:id
 * Get order details
 */
router.get(
    '/:id',
    authenticate,
    validate(getOrderSchema),
    isOwnerOrAdmin(async (req) => {
        const order = await Order.findByPk(req.params.id);
        return order?.UserId;
    }),
    async (req, res, next) => {
        try {
            const order = await orderService.getOrderWithDetails(req.params.id);
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/v1/orders/:id/status
 * Update order status (admin only)
 */
router.patch(
    '/:id/status',
    authenticate,
    isAdmin,
    validate(updateOrderStatusSchema),
    async (req, res, next) => {
        try {
            const { status, trackingNumber } = req.body;
            const orderId = req.params.id;

            const order = await Order.findByPk(orderId);
            if (!order) {
                throw new NotFoundError('Order not found');
            }

            const previousStatus = order.status;

            const updatedOrder = await orderService.updateOrderStatus(orderId, status, {
                trackingNumber
            });

            // Audit log
            await logUpdate(
                req,
                'Order',
                orderId,
                { status: previousStatus },
                { status: updatedOrder.status }
            );

            // Send email notifications based on status change
            try {
                if (status === 'shipped' && previousStatus !== 'shipped') {
                    await sendShippingNotification(updatedOrder);
                    logger.info('Shipping notification sent', { extra: { orderId } });
                } else if (status === 'delivered' && previousStatus !== 'delivered') {
                    await sendDeliveryConfirmation(updatedOrder);
                    logger.info('Delivery confirmation sent', { extra: { orderId } });
                }
            } catch (emailError) {
                logger.error('Failed to send status notification email', {
                    extra: { orderId, status, error: emailError.message }
                });
            }

            res.json(updatedOrder);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/v1/orders/:id/cancel
 * Cancel order (customer can cancel own pending orders)
 */
router.post(
    '/:id/cancel',
    authenticate,
    validate(getOrderSchema),
    isOwnerOrAdmin(async (req) => {
        const order = await Order.findByPk(req.params.id);
        return order?.UserId;
    }),
    async (req, res, next) => {
        try {
            const order = await Order.findByPk(req.params.id);

            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Only pending orders can be cancelled by customers
            if (order.status !== 'pending' && req.user.role !== 'admin') {
                throw new AppError('Only pending orders can be cancelled', 400, 'INVALID_STATUS');
            }

            const previousStatus = order.status;
            const cancelledOrder = await orderService.cancelOrder(req.params.id);

            // Audit log
            await logUpdate(
                req,
                'Order',
                req.params.id,
                { status: previousStatus },
                { status: 'cancelled' }
            );

            res.json(cancelledOrder);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
