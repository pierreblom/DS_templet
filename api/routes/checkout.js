const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Product, Order, OrderItem } = require('../../database/index');

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total amount from database prices
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }

            // Verify stock (optional)
            // if (product.stock < item.quantity) ...

            totalAmount += parseFloat(product.price) * item.quantity;
            orderItemsData.push({
                price: product.price,
                quantity: item.quantity,
                productId: product.id
            });
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe expects cents
            currency: 'zar', // South African Rand
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            totalAmount: totalAmount
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
