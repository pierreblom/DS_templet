/**
 * Contact Form Validation Rules
 * Validates contact form submissions with strict allow-list patterns
 *
 * Security: Uses Joi for schema validation
 */

const Joi = require('joi');

const contactSubmissionSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .pattern(/^[a-zA-Z\s\-']+$/)
            .required()
            .messages({
                'string.pattern.base':
                    'Name can only contain letters, spaces, hyphens, and apostrophes'
            }),

        email: Joi.string().email().max(255).required(),

        phone: Joi.string()
            .pattern(/^[0-9\s+\-()]+$/)
            .min(5)
            .max(20)
            .allow('', null)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number can only contain digits, spaces, +, -, (, )'
            }),

        comment: Joi.string()
            .max(1000)
            .replace(/[<>]/g, '') // Sanitize HTML tags
            .allow('', null)
            .optional()
    })
};

module.exports = {
    contactSubmissionSchema
};
