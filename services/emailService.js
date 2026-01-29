/**
 * Email Service
 * Handles sending transactional emails
 */
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');
const emailTemplates = require('./emailTemplates');

// Create transporter
let transporter;

if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    // Development: Log emails instead of sending
    logger.warn('Email service not configured - emails will be logged only');
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Bra Shop <noreply@shopbeha.com>';

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
async function sendEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text
    };

    if (!transporter) {
        // Development: Just log the email
        logger.info('Email (not sent - no email config)', {
            extra: { to, subject, textPreview: text?.substring(0, 100) }
        });
        return { success: true, mode: 'logged' };
    }

    try {
        const result = await transporter.sendMail(mailOptions);
        logger.info('Email sent successfully', {
            extra: { to, subject, messageId: result.messageId }
        });
        return { success: true, messageId: result.messageId };
    } catch (error) {
        logger.error('Failed to send email', {
            extra: { to, subject, error: error.message }
        });
        throw error;
    }
}

/**
 * Send order confirmation email
 * @param {Object} order - Order object with items
 */
async function sendOrderConfirmation(order) {
    const { html, text, subject } = emailTemplates.orderConfirmation(order);

    const recipientEmail = order.shipping_address?.email || order.User?.email;

    if (!recipientEmail) {
        logger.warn('Cannot send order confirmation - no email address', {
            extra: { orderId: order.id }
        });
        return;
    }

    return sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
}

/**
 * Send shipping notification email
 * @param {Object} order - Order object
 */
async function sendShippingNotification(order) {
    const { html, text, subject } = emailTemplates.shippingNotification(order);

    const recipientEmail = order.shipping_address?.email || order.User?.email;

    if (!recipientEmail) {
        logger.warn('Cannot send shipping notification - no email address', {
            extra: { orderId: order.id }
        });
        return;
    }

    return sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
}

/**
 * Send delivery confirmation email
 * @param {Object} order - Order object
 */
async function sendDeliveryConfirmation(order) {
    const { html, text, subject } = emailTemplates.deliveryConfirmation(order);

    const recipientEmail = order.shipping_address?.email || order.User?.email;

    if (!recipientEmail) {
        logger.warn('Cannot send delivery confirmation - no email address', {
            extra: { orderId: order.id }
        });
        return;
    }

    return sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
}

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendShippingNotification,
    sendDeliveryConfirmation
};
