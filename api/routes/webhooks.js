/**
 * Webhook Routes
 * Handle Stripe webhooks for payment events
 */
const express = require('express');
const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const stripe = require('stripe')(stripeKey);
const orderService = require('../services/order.service');
const { logger } = require('../../utils/logger');
const { sendOrderConfirmation } = require('../../services/emailService');

// Stripe webhook endpoint
// Note: This route uses raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // For development without webhook secret
            event = JSON.parse(req.body.toString());
            logger.warn('Webhook signature verification skipped - no webhook secret configured');
        }
    } catch (err) {
        logger.error('Webhook signature verification failed', {
            extra: { error: err.message }
        });
        return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                logger.info('Payment succeeded', {
                    extra: {
                        paymentIntentId: paymentIntent.id,
                        amount: paymentIntent.amount
                    }
                });

                // Fulfill the order
                try {
                    const order = await orderService.fulfillOrder(paymentIntent.id);
                    logger.info('Order fulfilled', {
                        extra: { paymentIntentId: paymentIntent.id, orderId: order.id }
                    });

                    // Send order confirmation email
                    try {
                        await sendOrderConfirmation(order);
                        logger.info('Order confirmation email sent', {
                            extra: { orderId: order.id }
                        });
                    } catch (emailError) {
                        logger.error('Failed to send order confirmation email', {
                            extra: { orderId: order.id, error: emailError.message }
                        });
                    }
                } catch (fulfillError) {
                    logger.error('Failed to fulfill order', {
                        extra: {
                            paymentIntentId: paymentIntent.id,
                            error: fulfillError.message
                        }
                    });
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                logger.warn('Payment failed', {
                    extra: {
                        paymentIntentId: paymentIntent.id,
                        error: paymentIntent.last_payment_error?.message
                    }
                });

                // Mark order as cancelled
                try {
                    const { Order } = require('../../database/index');
                    const order = await Order.findOne({
                        where: { payment_intent_id: paymentIntent.id }
                    });

                    if (order) {
                        await order.update({ status: 'cancelled' });
                        logger.info('Order cancelled due to payment failure', {
                            extra: { orderId: order.id }
                        });
                    }
                } catch (cancelError) {
                    logger.error('Failed to cancel order', {
                        extra: {
                            paymentIntentId: paymentIntent.id,
                            error: cancelError.message
                        }
                    });
                }
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object;
                logger.info('Charge refunded', {
                    extra: {
                        chargeId: charge.id,
                        amount: charge.amount_refunded
                    }
                });
                // TODO: Handle refund (update order status, email customer)
                break;
            }

            default:
                logger.debug(`Unhandled webhook event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('Webhook handler error', {
            extra: {
                eventType: event.type,
                error: error.message
            }
        });
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

module.exports = router;
