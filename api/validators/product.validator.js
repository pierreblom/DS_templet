/**
 * Product Validators
 * Using Joi with strict input validation (per xneelo guidelines)
 */
const Joi = require('joi');

const createProductSchema = {
    body: Joi.object({
        name: Joi.string().min(1).max(255).required().messages({
            'any.required': 'Product name is required',
            'string.max': 'Product name cannot exceed 255 characters'
        }),
        price: Joi.number().positive().precision(2).required().messages({
            'any.required': 'Price is required',
            'number.positive': 'Price must be a positive number'
        }),
        stock_quantity: Joi.number().integer().min(0).default(0),
        category: Joi.string().min(1).max(100).allow('').messages({
            'any.required': 'Category is required'
        }),
        rating: Joi.number().min(0).max(5).default(5),
        is_trail_favorite: Joi.boolean().default(false),
        image_url: Joi.string().uri().max(500).allow('').messages({
            'string.uri': 'Image URL must be a valid URL'
        }),
        hover_image_url: Joi.string().uri().max(500).allow('').messages({
            'string.uri': 'Hover image URL must be a valid URL'
        })
    })
};

const updateProductSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    body: Joi.object({
        name: Joi.string().min(1).max(255),
        price: Joi.number().positive().precision(2),
        stock_quantity: Joi.number().integer().min(0),
        category: Joi.string().min(1).max(100),
        rating: Joi.number().min(0).max(5),
        is_trail_favorite: Joi.boolean(),
        image_url: Joi.string().uri().max(500).allow(''),
        hover_image_url: Joi.string().uri().max(500).allow('')
    })
        .min(1)
        .message('At least one field must be provided for update')
};

const updateStockSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    body: Joi.object({
        stock: Joi.number().integer().min(0).required()
    })
};

const getProductSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    })
};

const listProductsSchema = {
    query: Joi.object({
        category: Joi.string().max(100),
        search: Joi.string().max(255),
        minPrice: Joi.number().positive(),
        maxPrice: Joi.number().positive(),
        inStock: Joi.boolean(),
        sortBy: Joi.string().valid('name', 'price', 'createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

module.exports = {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    getProductSchema,
    listProductsSchema
};
