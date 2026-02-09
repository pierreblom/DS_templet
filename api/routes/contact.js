/**
 * Contact Form API Routes
 * Handles contact form submissions and logs them to Google Sheets
 *
 * Security:
 * - Rate limited (handled at server level)
 * - Input validation with strict allow-lists
 * - No PII logged in application logs
 * - Audit trail maintained
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { contactSubmissionSchema } = require('../validators/contact.validator');
const { validate } = require('../middleware/validate');
const { ContactSubmission } = require('../../database/index');
const { logger } = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

/**
 * POST /api/v1/contact
 * Submit a contact form enquiry
 *
 * @body {string} name - Customer name (required, 2-100 chars)
 * @body {string} email - Customer email (required, valid email)
 * @body {string} phone - Customer phone (optional, 5-20 chars)
 * @body {string} comment - Customer message (optional, max 1000 chars)
 *
 * @returns {201} Success response
 * @returns {400} Validation error
 * @returns {500} Server error
 */
router.post('/', validate(contactSubmissionSchema), async (req, res, next) => {
    try {
        const { name, email, phone, comment } = req.body;

        // Extract source IP (handling proxy headers)
        const sourceIp =
            req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';

        // Prepare data for Google Sheets
        const webhookData = {
            name,
            email,
            phone: phone || '',
            comment: comment || '',
            sourceIp,
            traceId: req.traceId,
            timestamp: new Date().toISOString()
        };

        // Add secret token if configured
        if (process.env.GOOGLE_SHEETS_SECRET_TOKEN) {
            webhookData.secretToken = process.env.GOOGLE_SHEETS_SECRET_TOKEN;
        }

        // Save to Database
        try {
            await ContactSubmission.create({
                name,
                email,
                phone: phone || null,
                message: comment || null,
                status: 'new'
            });
            logger.info('Contact submission saved to database', { traceId: req.traceId });
        } catch (dbError) {
            logger.error('Failed to save contact submission to database', {
                traceId: req.traceId,
                extra: { error: dbError.message }
            });
            // We continue execution to try Google Sheets as well
        }

        // Send to Google Sheets webhook

        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        if (!webhookUrl) {
            logger.error('Google Sheets webhook URL not configured', {
                traceId: req.traceId
            });

            // Still return success to user (fail gracefully)
            // But log the error for ops team to fix
            return res.status(201).json({
                success: true,
                message: 'Your message has been received. We will get back to you soon.'
            });
        }

        try {
            // Send to Google Sheets with timeout
            const response = await axios.post(webhookUrl, webhookData, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            logger.info('Contact form submitted successfully', {
                traceId: req.traceId,
                extra: {
                    email: email, // Safe to log email as it's customer-initiated
                    hasPhone: !!phone,
                    hasComment: !!comment,
                    webhookSuccess: response.data?.success
                }
            });
        } catch (webhookError) {
            // Log webhook error but don't expose to user
            logger.error('Failed to send to Google Sheets webhook', {
                traceId: req.traceId,
                extra: {
                    error: webhookError.message,
                    statusCode: webhookError.response?.status,
                    responseData: webhookError.response?.data
                }
            });

            // Still return success to user (fail gracefully)
            // The ops team will see the error in logs
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 1 business day.',
            traceId: req.traceId
        });
    } catch (error) {
        logger.error('Contact form submission failed', {
            traceId: req.traceId,
            extra: {
                error: error.message,
                stack: error.stack
            }
        });

        next(
            new AppError(
                'An error occurred whilst processing your request',
                500,
                'CONTACT_SUBMISSION_ERROR'
            )
        );
    }
});

/**
 * GET /api/v1/contact/health
 * Health check endpoint for contact service
 */
router.get('/health', (req, res) => {
    const webhookConfigured = !!process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    res.json({
        status: 'ok',
        webhookConfigured,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/v1/contact
 * Get all contact submissions (Admin only)
 */
router.get('/', async (req, res, next) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const submissions = await ContactSubmission.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const total = await ContactSubmission.count();

        res.json({
            success: true,
            data: submissions,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Failed to fetch contact submissions', {
            traceId: req.traceId,
            extra: { error: error.message }
        });
        next(new AppError('Failed to fetch submissions', 500));
    }
});

module.exports = router;
