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
        description: Joi.string().max(5000).allow('').messages({
            'string.max': 'Description cannot exceed 5000 characters'
        }),
        price: Joi.number().positive().precision(2).required().messages({
            'any.required': 'Price is required',
            'number.positive': 'Price must be a positive number'
        }),
        category: Joi.string().min(1).max(100).required().messages({
            'any.required': 'Category is required'
        }),
        image_url: Joi.string().uri().max(500).allow('').messages({
            'string.uri': 'Image URL must be a valid URL'
        }),
        hover_image_url: Joi.string().uri().max(500).allow('').messages({
            'string.uri': 'Hover image URL must be a valid URL'
        }),
        stock: Joi.number().integer().min(0).default(0).messages({
            'number.min': 'Stock cannot be negative'
        })
    })
};

const updateProductSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    body: Joi.object({
        name: Joi.string().min(1).max(255),
        description: Joi.string().max(5000).allow(''),
        price: Joi.number().positive().precision(2),
        category: Joi.string().min(1).max(100),
        image_url: Joi.string().uri().max(500).allow(''),
        hover_image_url: Joi.string().uri().max(500).allow(''),
        stock: Joi.number().integer().min(0)
    })
        .min(1)
        .message('At least one field must be provided for update')
};

const updateStockSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    body: Joi.object({
        stock: Joi.number().integer().min(0).required().messages({
            'any.required': 'Stock value is required',
            'number.min': 'Stock cannot be negative'
        })
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
