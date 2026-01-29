/**
 * Analytics Routes
 * Admin only - dashboard and reporting
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');
const analyticsService = require('../services/analytics.service');

/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard summary
 */
router.get('/dashboard', authenticate, isAdmin, async (req, res, next) => {
    try {
        const summary = await analyticsService.getDashboardSummary();
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/analytics/sales
 * Get sales analytics
 */
router.get('/sales', authenticate, isAdmin, async (req, res, next) => {
    try {
        const { period = 'week', startDate, endDate } = req.query;
        const analytics = await analyticsService.getSalesAnalytics(period, startDate, endDate);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/analytics/products
 * Get product analytics
 */
router.get('/products', authenticate, isAdmin, async (req, res, next) => {
    try {
        const analytics = await analyticsService.getProductAnalytics();
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/analytics/orders
 * Get order analytics
 */
router.get('/orders', authenticate, isAdmin, async (req, res, next) => {
    try {
        const analytics = await analyticsService.getOrderAnalytics();
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
