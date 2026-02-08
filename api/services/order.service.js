/**
 * Order Service
 * Business logic for order management
 */
const { sequelize, Product, Order, OrderItem, GuestCustomer } = require('../../database/index');
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

        if (!product.is_active) {
            throw new Error(`Product ${product.name} is no longer available`);
        }

        if (product.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
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

const { calculateShipping, calculatePromoDiscount } = require('../../utils/pricing');

/**
 * Create a new order with items
 * @param {Object} params - Order parameters
 * @returns {Object} Created order with items
 */
async function createOrder({ userId, email, items, shippingAddress, guestInfo, promoCode }) {
    // Verify stock for all items first (just existence check now)
    const verifiedProducts = await verifyStock(items);

    // Calculate subtotal from verified DB prices
    const subtotal = calculateTotal(verifiedProducts);

    // Calculate discount
    const discount = calculatePromoDiscount(promoCode, subtotal);

    // Calculate shipping
    // Infer region from country code 'ZA' -> 'sa', anything else -> 'intl'
    const region = (shippingAddress?.country || 'ZA') === 'ZA' ? 'sa' : 'intl';
    const shipping = calculateShipping(subtotal - discount, region);

    // Calculate final total
    const totalAmount = Math.max(0, subtotal - discount) + shipping;

    // Create order and items in a transaction
    const order = await sequelize.transaction(async (t) => {
        let guestId = null;
        let finalEmail = email;

        // Handle Guest Checkout
        if (!userId && guestInfo) {
            // Create guest customer record
            const guest = await GuestCustomer.create({
                email: guestInfo.email,
                first_name: guestInfo.firstName,
                last_name: guestInfo.lastName, // or name split? user inputs separate fields
                phone: guestInfo.phone,
                shipping_address: shippingAddress
            }, { transaction: t });

            guestId = guest.id;
            finalEmail = guestInfo.email;
        }

        // Create order
        // Note: Order model has user_id, total_amount, status, shipping_address
        const newOrder = await Order.create(
            {
                user_id: userId || null, // Ensure explicit null if undefined
                guest_id: guestId,
                email: finalEmail || 'guest@example.com',
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress
            },
            { transaction: t }
        );

        // Create order items and update stock
        const orderItems = await Promise.all(
            verifiedProducts.map(async ({ product, quantity }) => {
                // Update stock
                await product.decrement('stock_quantity', { by: quantity, transaction: t });

                return OrderItem.create(
                    {
                        order_id: newOrder.id,
                        product_id: product.id,
                        quantity,
                        price: product.price, // Model uses 'price', not 'price_at_purchase'
                        product_name: product.name, // Model requires product_name
                        options: {} // Default empty options
                    },
                    { transaction: t }
                );
            })
        );

        return {
            order: newOrder,
            items: orderItems,
            pricing: {
                subtotal,
                discount,
                shipping,
                total: totalAmount
            }
        };
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
/**
 * Mark order as paid
 * @param {string} orderId - Order ID
 */
async function markOrderPaid(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    // Only update if not already paid
    if (order.status !== 'paid') {
        await order.update({ status: 'paid' });
    }

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

    // Start transaction to restore stock
    await sequelize.transaction(async (t) => {
        // Get order items
        const items = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [{ model: Product }]
        });

        // Restore stock for each item
        for (const item of items) {
            if (item.Product) {
                await item.Product.increment('stock_quantity', { by: item.quantity, transaction: t });
            }
        }

        await order.update({ status: 'cancelled' }, { transaction: t });
    });

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
                        attributes: ['id', 'name', 'image_url', 'supplier_url']
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
    markOrderPaid,
    cancelOrder,
    getOrderWithDetails
};
