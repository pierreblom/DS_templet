/**
 * Order Validators
 * Using Joi with strict input validation (per xneelo guidelines)
 */
const Joi = require('joi');

const shippingAddressSchema = Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    address1: Joi.string().min(1).max(255).required(),
    address2: Joi.string().max(255).allow(''),
    city: Joi.string().min(1).max(100).required(),
    state: Joi.string().max(100).allow(''),
    postalCode: Joi.string().min(1).max(20).required(),
    country: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
        .pattern(/^[\d\s+()-]+$/)
        .min(7)
        .max(20)
        .required()
        .messages({
            'string.pattern.base': 'Phone number can only contain digits, spaces, and +()-'
        }),
    email: Joi.string().email().max(255).required()
});

const orderItemSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(99).required()
});

const createOrderSchema = {
    body: Joi.object({
        items: Joi.array().items(orderItemSchema).min(1).required().messages({
            'array.min': 'Order must contain at least one item',
            'any.required': 'Order items are required'
        }),
        shippingAddress: shippingAddressSchema.required()
    })
};

const checkoutSchema = {
    body: Joi.object({
        items: Joi.array().items(orderItemSchema).min(1).required().messages({
            'array.min': 'Cart must contain at least one item',
            'any.required': 'Cart items are required'
        }),
        shippingAddress: shippingAddressSchema.required()
    })
};

const updateOrderStatusSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    body: Joi.object({
        status: Joi.string()
            .valid('pending', 'paid', 'shipped', 'delivered', 'cancelled')
            .required()
            .messages({
                'any.only': 'Status must be one of: pending, paid, shipped, delivered, cancelled',
                'any.required': 'Status is required'
            }),
        trackingNumber: Joi.string().max(100).when('status', {
            is: 'shipped',
            then: Joi.string().optional()
        })
    })
};

const getOrderSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    })
};

const listOrdersSchema = {
    query: Joi.object({
        status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso().greater(Joi.ref('startDate')),
        sortBy: Joi.string().valid('createdAt', 'total_amount', 'status').default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

module.exports = {
    createOrderSchema,
    checkoutSchema,
    updateOrderStatusSchema,
    getOrderSchema,
    listOrdersSchema
};
