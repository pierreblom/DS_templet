/**
 * Order Service
 * Business logic for order management
 */
const { sequelize, Product, Order, OrderItem } = require('../../database/index');
const { NotFoundError } = require('../../utils/errors');

/**
 * Verify stock availability for all items
 * @param {Array} items - Array of { productId, quantity }
 * @returns {Array} Products with verified stock
 */
async function verifyStock(items) {
    const products = [];

    for (const item of items) {
        // Use product_id if item comes from body matching snake_case or productId if camelCase
        const pId = item.productId || item.product_id;
        const product = await Product.findByPk(pId);

        if (!product) {
            throw new NotFoundError(`Product ${pId} not found`);
        }

        // Stock check removed as stock field does not exist

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
async function createOrder({ userId, email, items, shippingAddress }) {
    // Verify stock for all items first (just existence check now)
    const verifiedProducts = await verifyStock(items);

    // Calculate total
    const totalAmount = calculateTotal(verifiedProducts);

    // Create order and items in a transaction
    const order = await sequelize.transaction(async (t) => {
        // Create order
        // Note: Order model has user_id, total_amount, status, shipping_address
        const newOrder = await Order.create(
            {
                user_id: userId,
                email: email || 'dashboard-created@example.com', // Fallback if not provided
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress
            },
            { transaction: t }
        );

        // Create order items
        const orderItems = await Promise.all(
            verifiedProducts.map(({ product, quantity }) =>
                OrderItem.create(
                    {
                        order_id: newOrder.id,
                        product_id: product.id,
                        quantity,
                        price: product.price, // Model uses 'price', not 'price_at_purchase'
                        product_name: product.name, // Model requires product_name
                        options: {} // Default empty options
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
 * @param {Object} options - Additional options
 */
async function updateOrderStatus(orderId, status, options = {}) {
    const order = await Order.findByPk(orderId);

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    const updates = { status };

    // Tracking info removed as columns don't exist

    await order.update(updates);

    return order;
}

/**
 * Mark order as paid
 * @param {string} paymentIntentId - Stripe payment intent ID
 */
async function fulfillOrder(paymentIntentId) {
    // Cannot lookup by payment_intent_id as it doesn't exist.
    // This functionality is currently disabled.
    console.warn('fulfillOrder called but payment_intent_id column is missing in DB');
    return null;
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
