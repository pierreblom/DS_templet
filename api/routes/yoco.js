const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Product } = require('../../database/index');
const { calculateShipping, calculatePromoDiscount } = require('../../utils/pricing');

// Create a Yoco checkout session
router.post('/create-checkout', async (req, res) => {
    try {
        const { items, promoCode, region, successUrl, cancelUrl } = req.body;

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Cart items are required' }
            });
        }

        // Fetch product prices from database to prevent price manipulation
        const productIds = items.map(item => item.productId);
        const products = await Product.findAll({
            where: { id: productIds, is_active: true },
            attributes: ['id', 'price']
        });

        if (products.length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'No valid products found in cart' }
            });
        }

        // Create a map for quick lookup
        const productMap = {};
        products.forEach(p => {
            productMap[p.id] = p.price;
        });

        // Calculate subtotal based on DATABASE prices (not client prices)
        let subtotal = 0;
        for (const item of items) {
            const dbPrice = productMap[item.productId];
            if (!dbPrice) {
                return res.status(400).json({
                    success: false,
                    error: { message: `Product ${item.productId} not found or inactive` }
                });
            }
            subtotal += dbPrice * (item.quantity || 1);
        }

        // Apply promo code discount (server-side validation)
        const discount = calculatePromoDiscount(promoCode, subtotal);

        // Calculate shipping
        const shipping = calculateShipping(subtotal - discount, region);

        // Calculate final total
        const total = Math.max(0, subtotal - discount) + shipping;

        // Convert to cents for Yoco (Yoco expects amount in cents)
        const amountInCents = Math.round(total * 100);

        if (amountInCents < 200) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid amount. Minimum is 200 cents (R 2.00)' }
            });
        }

        const checkoutData = {
            amount: amountInCents,
            currency: 'ZAR',
            successUrl: successUrl || `${req.protocol}://${req.get('host')}/orders?status=success`,
            cancelUrl: cancelUrl || `${req.protocol}://${req.get('host')}/checkout`,
            metadata: req.body.metadata || {}
        };

        const secretKey = (process.env.Secret_Key || '').trim();

        const debugLogPath = path.join(__dirname, '../../../yoco_debug.log');
        const logData = `
--- REQUEST ${new Date().toISOString()} ---
Subtotal: R ${subtotal.toFixed(2)}
Discount: R ${discount.toFixed(2)}
Shipping: R ${shipping.toFixed(2)}
Total: R ${total.toFixed(2)}
Amount (cents): ${amountInCents}
Promo Code: ${promoCode || 'none'}
Region: ${region || 'sa'}
SecretKey (first 10): ${secretKey ? secretKey.substring(0, 10) : 'MISSING'}
Payload: ${JSON.stringify(checkoutData, null, 2)}
-------------------------------------------
`;
        fs.appendFileSync(debugLogPath, logData);

        try {
            const response = await axios.post(
                'https://payments.yoco.com/api/checkouts',
                checkoutData,
                {
                    headers: {
                        'Authorization': `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10s timeout
                }
            );

            fs.appendFileSync(debugLogPath, `SUCCESS: ${JSON.stringify(response.data)}\n`);

            return res.json({
                success: true,
                checkoutUrl: response.data.redirectUrl,
                checkoutId: response.data.id,
                // Return calculated amounts for frontend verification
                calculatedTotal: {
                    subtotal: Math.round(subtotal * 100) / 100,
                    discount: Math.round(discount * 100) / 100,
                    shipping: Math.round(shipping * 100) / 100,
                    total: Math.round(total * 100) / 100
                }
            });
        } catch (apiError) {
            const status = apiError.response?.status || 500;
            const data = apiError.response?.data;

            const errorDetails = {
                status: apiError.response?.status,
                data: apiError.response?.data,
                message: apiError.message
            };
            fs.appendFileSync(debugLogPath, `ERROR: ${JSON.stringify(errorDetails, null, 2)}\n`);

            return res.status(status).json({
                success: false,
                error: data || { message: apiError.message }
            });
        }
    } catch (outerError) {
        console.error('Outer Yoco Error:', outerError);
        res.status(500).json({
            success: false,
            error: { message: outerError.message }
        });
    }
});

const { markOrderPaid, updateOrderStatus, cancelOrder } = require('../services/order.service');

// Webhook endpoint to handle Yoco payment notifications
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = JSON.parse(req.body.toString());

        console.log('Yoco webhook received:', event);

        // Handle different event types
        switch (event.type) {
            case 'checkout.succeeded':
                // Payment was successful
                console.log('Payment succeeded:', event.payload);
                const orderId = event.payload.metadata?.orderId;

                if (orderId) {
                    await markOrderPaid(orderId);
                    console.log(`Order ${orderId} marked as paid`);
                }
                break;

            case 'checkout.failed':
                // Payment failed
                console.log('Payment failed:', event.payload);
                const failedOrderId = event.payload.metadata?.orderId;
                if (failedOrderId) {
                    try {
                        await cancelOrder(failedOrderId);
                        console.log(`Order ${failedOrderId} cancelled due to failed payment`);
                    } catch (e) {
                        console.error('Error cancelling order', e);
                    }
                }
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }

        // Acknowledge receipt of webhook
        res.sendStatus(200);

    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

module.exports = router;
