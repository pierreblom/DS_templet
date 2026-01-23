const express = require('express');
const router = express.Router();
const axios = require('axios');

// Create a Yoco checkout session
router.post('/create-checkout', async (req, res) => {
    try {
        const { amount, currency, successUrl, cancelUrl, failureUrl, metadata } = req.body;

        // Validate required fields
        if (!amount || !currency) {
            return res.status(400).json({
                error: 'Missing required fields: amount and currency are required'
            });
        }

        const checkoutData = {
            amount: amount,
            currency: currency,
            successUrl: successUrl || `${req.protocol}://${req.get('host')}/success.html`,
            cancelUrl: cancelUrl || `${req.protocol}://${req.get('host')}/checkout.html`,
            failureUrl: failureUrl || `${req.protocol}://${req.get('host')}/checkout.html?error=payment_failed`,
            metadata: metadata || {}
        };

        // Call Yoco Checkouts API
        const response = await axios.post(
            'https://payments.yoco.com/api/checkouts',
            checkoutData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.Secret_Key}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Return the checkout URL to the frontend
        res.json({
            success: true,
            checkoutUrl: response.data.redirectUrl,
            checkoutId: response.data.id
        });

    } catch (error) {
        console.error('Yoco checkout creation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || 'Failed to create checkout session'
        });
    }
});

// Webhook endpoint to handle Yoco payment notifications
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = JSON.parse(req.body.toString());

        console.log('Yoco webhook received:', event);

        // Initialize Supabase client for server-side
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        // Handle different event types
        switch (event.type) {
            case 'checkout.succeeded':
                // Payment was successful
                console.log('Payment succeeded:', event.payload);
                const orderId = event.payload.metadata?.orderId;

                if (orderId) {
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: 'paid' })
                        .eq('id', orderId);

                    if (error) console.error('Error updating order status:', error);
                    else console.log(`Order ${orderId} marked as paid`);
                }
                break;

            case 'checkout.failed':
                // Payment failed
                console.log('Payment failed:', event.payload);
                const failedOrderId = event.payload.metadata?.orderId;
                if (failedOrderId) {
                    await supabase
                        .from('orders')
                        .update({ status: 'cancelled' })
                        .eq('id', failedOrderId);
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
