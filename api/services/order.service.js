/**
 * Order Service
 * Business logic for order management
 */
const { sequelize, Product, Order, OrderItem } = require('../../database/index');
const { InsufficientStockError, NotFoundError } = require('../../utils/errors');

/**
 * Verify stock availability for all items
 * @param {Array} items - Array of { productId, quantity }
 * @returns {Array} Products with verified stock
 */
async function verifyStock(items) {
    const products = [];

    for (const item of items) {
        const product = await Product.findByPk(item.productId);

        if (!product) {
            throw new NotFoundError(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
            throw new InsufficientStockError(
                product.id,
                product.name,
                product.stock,
                item.quantity
            );
        }

        products.push({
            product,
            quantity: item.quantity
        });
    }

    return products;
}

/**
 * Calculate order total from products
 * @param {Array} products - Array of { product, quantity }
 * @returns {number} Total amount
 */
function calculateTotal(products) {
    return products.reduce((total, { product, quantity }) => {
        return total + parseFloat(product.price) * quantity;
    }, 0);
}

/**
 * Create a new order with items
 * @param {Object} params - Order parameters
 * @returns {Object} Created order with items
 */
async function createOrder({ userId, items, shippingAddress, paymentIntentId }) {
    // Verify stock for all items first
    const verifiedProducts = await verifyStock(items);

    // Calculate total
    const totalAmount = calculateTotal(verifiedProducts);

    // Create order and items in a transaction
    const order = await sequelize.transaction(async (t) => {
        // Create order
        const newOrder = await Order.create(
            {
                UserId: userId,
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress,
                payment_intent_id: paymentIntentId
            },
            { transaction: t }
        );

        // Create order items
        const orderItems = await Promise.all(
            verifiedProducts.map(({ product, quantity }) =>
                OrderItem.create(
                    {
                        OrderId: newOrder.id,
                        ProductId: product.id,
                        quantity,
                        price_at_purchase: product.price
                    },
                    { transaction: t }
                )
            )
        );

        return { order: newOrder, items: orderItems };
    });

    return order;
}

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} options - Additional options (trackingNumber, etc.)
 */
async function updateOrderStatus(orderId, status, options = {}) {
    const order = await Order.findByPk(orderId);

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    const updates = { status };

    if (status === 'shipped' && options.trackingNumber) {
        updates.tracking_number = options.trackingNumber;
        updates.shipped_at = new Date();
    }

    if (status === 'delivered') {
        updates.delivered_at = new Date();
    }

    await order.update(updates);

    return order;
}

/**
 * Mark order as paid and decrement stock
 * @param {string} paymentIntentId - Stripe payment intent ID
 */
async function fulfillOrder(paymentIntentId) {
    const order = await Order.findOne({
        where: { payment_intent_id: paymentIntentId },
        include: [{ model: OrderItem, include: [Product] }]
    });

    if (!order) {
        throw new NotFoundError('Order not found for payment intent');
    }

    // Update order and decrement stock in a transaction
    await sequelize.transaction(async (t) => {
        // Update order status
        await order.update({ status: 'paid' }, { transaction: t });

        // Decrement stock for each item
        for (const item of order.OrderItems) {
            await Product.decrement('stock', {
                by: item.quantity,
                where: { id: item.ProductId },
                transaction: t
            });
        }
    });

    // Reload to get updated data
    await order.reload({
        include: [{ model: OrderItem, include: [Product] }]
    });

    return order;
}

/**
 * Cancel order (only if pending)
 * @param {number} orderId - Order ID
 */
async function cancelOrder(orderId) {
    const order = await Order.findByPk(orderId);

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.status !== 'pending') {
        throw new Error('Only pending orders can be cancelled');
    }

    await order.update({ status: 'cancelled' });

    return order;
}

/**
 * Get order with all details
 * @param {number} orderId - Order ID
 */
async function getOrderWithDetails(orderId) {
    const order = await Order.findByPk(orderId, {
        include: [
            {
                model: OrderItem,
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'name', 'image_url']
                    }
                ]
            }
        ]
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    return order;
}

module.exports = {
    verifyStock,
    calculateTotal,
    createOrder,
    updateOrderStatus,
    fulfillOrder,
    cancelOrder,
    getOrderWithDetails
};
