/**
 * Input Validation Middleware using Joi
 * Following xneelo security guidelines for parameter handling
 */
const { ValidationError } = require('../../utils/errors');

/**
 * Create validation middleware for a Joi schema
 * @param {Object} schema - Joi schema object with body, query, params keys
 */
function validate(schema) {
    return async (req, res, next) => {
        const validationErrors = [];

        // Validate request body
        if (schema.body) {
            const { error, value } = schema.body.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                validationErrors.push(...formatJoiErrors(error, 'body'));
            } else {
                req.body = value;
            }
        }

        // Validate query parameters
        if (schema.query) {
            const { error, value } = schema.query.validate(req.query, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                validationErrors.push(...formatJoiErrors(error, 'query'));
            } else {
                req.query = value;
            }
        }

        // Validate URL parameters
        if (schema.params) {
            const { error, value } = schema.params.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                validationErrors.push(...formatJoiErrors(error, 'params'));
            } else {
                req.params = value;
            }
        }

        if (validationErrors.length > 0) {
            return next(new ValidationError('Validation failed', validationErrors));
        }

        next();
    };
}

/**
 * Format Joi validation errors into a consistent structure
 */
function formatJoiErrors(error, location) {
    return error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        location
    }));
}

module.exports = { validate };
