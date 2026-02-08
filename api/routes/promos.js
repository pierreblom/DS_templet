/**
 * Promo Code Routes
 * Validates promo codes server-side to prevent client-side manipulation
 */
const express = require('express');
const router = express.Router();
const { AppError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { getPromo, calculatePromoDiscount, VALID_PROMOS } = require('../../utils/pricing');

/**
 * POST /api/v1/promos/validate
 * Validate a promo code and return discount information
 */
router.post('/validate', async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;

        // Validate input
        if (!code || typeof code !== 'string') {
            throw new AppError('Promo code is required', 400, 'INVALID_INPUT');
        }

        if (subtotal === undefined || typeof subtotal !== 'number' || subtotal < 0) {
            throw new AppError('Valid subtotal is required', 400, 'INVALID_INPUT');
        }

        const upperCode = code.trim().toUpperCase();

        // Check if promo exists
        const promo = getPromo(upperCode);

        if (!promo) {
            return res.status(404).json({
                success: false,
                message: 'Invalid promo code'
            });
        }

        // Check if promo is active
        if (!promo.active) {
            return res.status(400).json({
                success: false,
                message: 'This promo code is no longer active'
            });
        }

        // Check expiration
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This promo code has expired'
            });
        }

        // Check minimum purchase
        if (promo.minPurchase && subtotal < promo.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of R ${(promo.minPurchase / 100).toFixed(2)} required for this promo code`
            });
        }

        // Calculate discount using shared utility
        const discount = calculatePromoDiscount(upperCode, subtotal);

        logger.info('Promo code validated', {
            extra: { code: upperCode, subtotal, discount }
        });

        res.json({
            success: true,
            promo: {
                code: promo.code,
                discountRate: promo.discountRate,
                description: promo.description,
                discount: discount
            },
            message: promo.description
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/promos/active
 * Get list of active promo codes (for admin or marketing purposes)
 * Note: This should be protected with admin auth in production
 */
router.get('/active', async (req, res, next) => {
    try {
        const activePromos = Object.values(VALID_PROMOS)
            .filter(promo => promo.active)
            .filter(promo => !promo.expiresAt || new Date(promo.expiresAt) >= new Date())
            .map(promo => ({
                code: promo.code,
                description: promo.description,
                discountRate: promo.discountRate,
                minPurchase: promo.minPurchase,
                expiresAt: promo.expiresAt
            }));

        res.json({ promos: activePromos });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
