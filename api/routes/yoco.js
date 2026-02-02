const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create a Yoco checkout session
router.post('/create-checkout', async (req, res) => {
    try {
        const { amount, successUrl, cancelUrl } = req.body;

        const safeAmount = Math.round(Number(amount));

        if (isNaN(safeAmount) || safeAmount < 200) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid amount. Minimum is 200 cents (R 2.00)' }
            });
        }

        const checkoutData = {
            amount: safeAmount,
            currency: 'ZAR',
            successUrl: successUrl || `${req.protocol}://${req.get('host')}/orders?status=success`,
            cancelUrl: cancelUrl || `${req.protocol}://${req.get('host')}/checkout`
        };

        const secretKey = (process.env.Secret_Key || '').trim();

        const debugLogPath = path.join(__dirname, '../../../yoco_debug.log');
        const logData = `
--- REQUEST ${new Date().toISOString()} ---
Amount: ${safeAmount}
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
                checkoutId: response.data.id
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
