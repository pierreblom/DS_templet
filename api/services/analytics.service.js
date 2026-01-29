/**
 * Analytics Service
 * Business logic for analytics and reporting
 */
const { sequelize, Order, OrderItem, Product, User } = require('../../database/index');
const { Op } = require('sequelize');

/**
 * Get sales analytics for a time period
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 */
async function getSalesAnalytics(period = 'week', startDate, endDate) {
    // Calculate date range based on period
    const now = new Date();
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : now;

    if (!startDate) {
        switch (period) {
            case 'day':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
        }
    }

    // Get orders in the period
    const orders = await Order.findAll({
        where: {
            created_at: {
                [Op.between]: [start, end]
            },
            status: {
                [Op.in]: ['paid', 'shipped', 'delivered']
            }
        },
        attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
            [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true
    });

    // Get totals
    const totals = await Order.findOne({
        where: {
            created_at: {
                [Op.between]: [start, end]
            },
            status: {
                [Op.in]: ['paid', 'shipped', 'delivered']
            }
        },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
            [sequelize.fn('AVG', sequelize.col('total_amount')), 'averageOrderValue']
        ],
        raw: true
    });

    return {
        period,
        startDate: start,
        endDate: end,
        dailyData: orders,
        summary: {
            totalOrders: parseInt(totals.totalOrders) || 0,
            totalRevenue: parseFloat(totals.totalRevenue) || 0,
            averageOrderValue: parseFloat(totals.averageOrderValue) || 0
        }
    };
}

/**
 * Get product analytics
 */
async function getProductAnalytics() {
    // Best sellers (by quantity sold)
    const bestSellers = await OrderItem.findAll({
        attributes: [
            'ProductId',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
            [sequelize.fn('SUM', sequelize.literal('quantity * price_at_purchase')), 'totalRevenue']
        ],
        include: [
            {
                model: Product,
                attributes: ['id', 'name', 'price', 'stock', 'image_url']
            }
        ],
        group: ['ProductId', 'Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 10,
        raw: false
    });

    // Low stock products (stock <= 10)
    const lowStock = await Product.findAll({
        where: {
            stock: { [Op.lte]: 10 },
            isActive: true
        },
        attributes: ['id', 'name', 'stock', 'price'],
        order: [['stock', 'ASC']],
        limit: 10
    });

    // Out of stock products
    const outOfStock = await Product.count({
        where: {
            stock: 0,
            isActive: true
        }
    });

    // Total active products
    const totalProducts = await Product.count({
        where: { isActive: true }
    });

    return {
        bestSellers: bestSellers.map((item) => ({
            product: item.Product,
            totalSold: parseInt(item.dataValues.totalSold),
            totalRevenue: parseFloat(item.dataValues.totalRevenue)
        })),
        lowStock,
        outOfStockCount: outOfStock,
        totalProducts
    };
}

/**
 * Get order analytics by status
 */
async function getOrderAnalytics() {
    // Orders by status
    const byStatus = await Order.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
    });

    // Recent orders (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentOrders = await Order.count({
        where: {
            created_at: { [Op.gte]: yesterday }
        }
    });

    // Pending orders that need attention
    const pendingOrders = await Order.count({
        where: { status: 'pending' }
    });

    // Paid orders ready to ship
    const readyToShip = await Order.count({
        where: { status: 'paid' }
    });

    return {
        byStatus: byStatus.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
        }, {}),
        recentOrders,
        pendingOrders,
        readyToShip
    };
}

/**
 * Get dashboard summary
 */
async function getDashboardSummary() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total revenue (last 30 days)
    const revenueResult = await Order.findOne({
        where: {
            created_at: { [Op.gte]: thirtyDaysAgo },
            status: { [Op.in]: ['paid', 'shipped', 'delivered'] }
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']],
        raw: true
    });

    // Total orders (last 30 days)
    const ordersCount = await Order.count({
        where: {
            created_at: { [Op.gte]: thirtyDaysAgo }
        }
    });

    // Total customers
    const customersCount = await User.count({
        where: { role: 'customer' }
    });

    // Total products
    const productsCount = await Product.count({
        where: { isActive: true }
    });

    return {
        revenue: parseFloat(revenueResult.revenue) || 0,
        orders: ordersCount,
        customers: customersCount,
        products: productsCount,
        period: 'Last 30 days'
    };
}

module.exports = {
    getSalesAnalytics,
    getProductAnalytics,
    getOrderAnalytics,
    getDashboardSummary
};
