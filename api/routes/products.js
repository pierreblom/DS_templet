/**
 * Product Routes
 * Public: List, Get
 * Admin: Create, Update, Delete, Stock management
 */
const express = require('express');
const router = express.Router();
const { Product } = require('../../database/index');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    getProductSchema,
    listProductsSchema
} = require('../validators/product.validator');
const { logCreate, logUpdate, logDelete } = require('../middleware/auditLogger');
const { NotFoundError } = require('../../utils/errors');

/**
 * GET /api/v1/products
 * List all products with optional filtering and pagination (public)
 */
router.get('/', validate(listProductsSchema), async (req, res, next) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            inStock,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (minPrice !== undefined) {
            where.price = { ...where.price, [Op.gte]: minPrice };
        }

        if (maxPrice !== undefined) {
            where.price = { ...where.price, [Op.lte]: maxPrice };
        }

        if (inStock === true || inStock === 'true') {
            where.stock = { [Op.gt]: 0 };
        }

        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit,
            offset
        });

        res.json({
            products,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/products/:id
 * Get single product (public)
 */
router.get('/:id', validate(getProductSchema), async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/products
 * Create new product (admin only)
 */
router.post('/', authenticate, isAdmin, validate(createProductSchema), async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        // Audit log
        await logCreate(req, 'Product', product.id, product);

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/products/:id
 * Update product (admin only)
 */
router.put('/:id', authenticate, isAdmin, validate(updateProductSchema), async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        const previousState = product.toJSON();
        await product.update(req.body);

        // Audit log
        await logUpdate(req, 'Product', product.id, previousState, product);

        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/products/:id/stock
 * Update product stock (admin only)
 */
router.patch(
    '/:id/stock',
    authenticate,
    isAdmin,
    validate(updateStockSchema),
    async (req, res, next) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                throw new NotFoundError('Product not found');
            }

            const previousState = { stock: product.stock };
            await product.update({ stock: req.body.stock });

            // Audit log
            await logUpdate(req, 'Product', product.id, previousState, { stock: product.stock });

            res.json({
                id: product.id,
                name: product.name,
                stock: product.stock
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/v1/products/:id
 * Soft delete product (admin only)
 */
router.delete('/:id', authenticate, isAdmin, validate(getProductSchema), async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        const previousState = product.toJSON();
        await product.softDelete();

        // Audit log
        await logDelete(req, 'Product', product.id, previousState);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/products/admin/all
 * List all products including deleted (admin only)
 */
router.get('/admin/all', authenticate, isAdmin, async (req, res, next) => {
    try {
        const products = await Product.scope('withDeleted').findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/products/:id/restore
 * Restore soft-deleted product (admin only)
 */
router.patch('/:id/restore', authenticate, isAdmin, async (req, res, next) => {
    try {
        const product = await Product.scope('withDeleted').findByPk(req.params.id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        await product.restore();

        // Audit log
        await logUpdate(req, 'Product', product.id, { isActive: false }, { isActive: true });

        res.json(product);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
