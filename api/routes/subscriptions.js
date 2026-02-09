/**
 * Subscriptions API Routes
 * Handles newsletter subscriptions
 */

const express = require('express');
const router = express.Router();
const { Subscription } = require('../../database/index');
const { logger } = require('../../utils/logger');
const Joi = require('joi');
const { validate } = require('../middleware/validate');

// Validation schema
const subscriptionSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    source: Joi.string().optional().allow('').default('website')
});

/**
 * POST /api/v1/subscriptions
 * Subscribe to the newsletter
 */
router.post('/', validate(subscriptionSchema), async (req, res) => {
    try {
        const { email, source } = req.body;

        // Check if already subscribed
        const existing = await Subscription.findOne({ where: { email } });

        if (existing) {
            if (existing.status === 'unsubscribed') {
                // Resubscribe
                existing.status = 'active';
                existing.source = source || existing.source;
                await existing.save();

                logger.info('User resubscribed', { traceId: req.traceId, extra: { email } });

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed.'
                });
            } else {
                // Already active
                return res.status(200).json({
                    success: true,
                    message: 'You are already subscribed!'
                });
            }
        }

        // Create new subscription
        await Subscription.create({
            email,
            status: 'active',
            source: source || 'website'
        });

        logger.info('New subscription created', { traceId: req.traceId, extra: { email } });

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing!'
        });

    } catch (error) {
        logger.error('Subscription failed', {
            traceId: req.traceId,
            extra: { error: error.message }
        });

        // Handle unique constraint violation just in case race condition
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({
                success: true,
                message: 'You are already subscribed!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while subscribing. Please try again.'
        });
    }
});

/**
 * GET /api/v1/subscriptions
 * Get all subscriptions (Admin only)
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0, status } = req.query;
        const where = {};
        if (status) where.status = status;

        const subscriptions = await Subscription.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const total = await Subscription.count({ where });

        res.json({
            success: true,
            data: subscriptions,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Failed to fetch subscriptions', {
            traceId: req.traceId,
            extra: { error: error.message }
        });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriptions'
        });
    }
});

module.exports = router;
