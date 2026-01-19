const express = require('express');
const router = express.Router();
const { Product } = require('../../database/index');
const { Op } = require('sequelize');

// GET /api/products - List all products with optional filtering
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            where.name = {
                [Op.like]: `%${search}%`
            };
        }

        const products = await Product.findAll({ where });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
