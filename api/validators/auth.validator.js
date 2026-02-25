/**
 * Authentication Validators
 * Using Joi with strict input validation (per xneelo guidelines)
 */
const Joi = require('joi');

// Password requirements: minimum 8 chars, at least one letter and one number
const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .message('Password must be at least 8 characters with at least one letter and one number');

const registerSchema = {
    body: Joi.object({
        email: Joi.string().email().max(255).required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: passwordSchema.required().messages({
            'any.required': 'Password is required'
        }),
        name: Joi.string()
            .min(1)
            .max(100)
            .pattern(/^[\p{L}\p{M}\s'-]+$/u)
            .required()
            .messages({
                'string.pattern.base':
                    'Name can only contain letters, spaces, hyphens, and apostrophes',
                'any.required': 'Name is required'
            })
    })
};

const loginSchema = {
    body: Joi.object({
        email: Joi.string().email().max(255).required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required'
        })
    })
};

const refreshTokenSchema = {
    body: Joi.object({
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token is required'
        })
    })
};

const updateProfileSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .pattern(/^[\p{L}\p{M}\s'-]+$/u)
            .messages({
                'string.pattern.base':
                    'Name can only contain letters, spaces, hyphens, and apostrophes'
            }),
        first_name: Joi.string().max(100).allow(''),
        last_name: Joi.string().max(100).allow(''),
        phone: Joi.string().max(30).allow(''),
        address: Joi.string().max(500).allow(''),
        city: Joi.string().max(100).allow(''),
        postal_code: Joi.string().max(20).allow(''),
        email: Joi.string().email().max(255).messages({
            'string.email': 'Please provide a valid email address'
        })
    })
        .min(1)
        .message('At least one field must be provided for update')
};

const changePasswordSchema = {
    body: Joi.object({
        currentPassword: Joi.string().allow('').messages({
            'any.required': 'Current password is required'
        }),
        newPassword: passwordSchema.required().messages({
            'any.required': 'New password is required'
        })
    })
};

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    changePasswordSchema
};
