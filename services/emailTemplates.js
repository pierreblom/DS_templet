/**
 * Email Templates
 * HTML and text templates for transactional emails
 */

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const baseStyles = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #A0522D; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background-color: #ffffff; }
    .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .order-table th { background-color: #f9f9f9; font-weight: 600; }
    .total-row { font-weight: bold; font-size: 18px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #A0522D; color: white; text-decoration: none; border-radius: 6px; }
    .address-box { background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
`;

/**
 * Order Confirmation Email
 */
function orderConfirmation(order) {
    const items = order.OrderItems || [];
    const address = order.shipping_address || {};

    const itemsHtml = items
        .map(
            (item) => `
        <tr>
            <td>${item.Product?.name || 'Product'}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.price_at_purchase)}</td>
            <td style="text-align: right;">${formatCurrency(item.price_at_purchase * item.quantity)}</td>
        </tr>
    `
        )
        .join('');

    const itemsText = items
        .map(
            (item) =>
                `- ${item.Product?.name || 'Product'} x ${item.quantity}: ${formatCurrency(item.price_at_purchase * item.quantity)}`
        )
        .join('\n');

    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Confirmed!</h1>
                </div>
                <div class="content">
                    <p>Hi ${address.firstName || 'there'},</p>
                    <p>Thank you for your order! We've received your order and it's being processed.</p>

                    <h3>Order Details</h3>
                    <p><strong>Order Number:</strong> #${order.id}</p>
                    <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>

                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Order Total:</td>
                                <td style="text-align: right;">${formatCurrency(order.total_amount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>Shipping Address</h3>
                    <div class="address-box">
                        ${address.firstName} ${address.lastName}<br>
                        ${address.address1}<br>
                        ${address.address2 ? address.address2 + '<br>' : ''}
                        ${address.city}, ${address.state || ''} ${address.postalCode}<br>
                        ${address.country}
                    </div>

                    <p>We'll send you another email when your order ships.</p>
                </div>
                <div class="footer">
                    <p>Bra Shop | Quality Comfort, Confident You</p>
                    <p>If you have questions, reply to this email or contact us.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
ORDER CONFIRMED!

Hi ${address.firstName || 'there'},

Thank you for your order! We've received your order and it's being processed.

ORDER DETAILS
Order Number: #${order.id}
Order Date: ${formatDate(order.created_at)}

ITEMS:
${itemsText}

Order Total: ${formatCurrency(order.total_amount)}

SHIPPING ADDRESS:
${address.firstName} ${address.lastName}
${address.address1}
${address.address2 ? address.address2 + '\n' : ''}${address.city}, ${address.state || ''} ${address.postalCode}
${address.country}

We'll send you another email when your order ships.

---
Bra Shop | Quality Comfort, Confident You
    `.trim();

    return {
        subject: `Order Confirmed - #${order.id}`,
        html,
        text
    };
}

/**
 * Shipping Notification Email
 */
function shippingNotification(order) {
    const address = order.shipping_address || {};
    const trackingNumber = order.tracking_number;

    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Order Has Shipped!</h1>
                </div>
                <div class="content">
                    <p>Hi ${address.firstName || 'there'},</p>
                    <p>Great news! Your order #${order.id} is on its way.</p>

                    ${trackingNumber
            ? `
                        <div class="address-box">
                            <strong>Tracking Number:</strong> ${trackingNumber}
                        </div>
                    `
            : ''
        }

                    <h3>Shipping To</h3>
                    <div class="address-box">
                        ${address.firstName} ${address.lastName}<br>
                        ${address.address1}<br>
                        ${address.address2 ? address.address2 + '<br>' : ''}
                        ${address.city}, ${address.state || ''} ${address.postalCode}<br>
                        ${address.country}
                    </div>

                    <p>Your package should arrive within 3-7 business days.</p>
                </div>
                <div class="footer">
                    <p>Bra Shop | Quality Comfort, Confident You</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
YOUR ORDER HAS SHIPPED!

Hi ${address.firstName || 'there'},

Great news! Your order #${order.id} is on its way.

${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}

SHIPPING TO:
${address.firstName} ${address.lastName}
${address.address1}
${address.address2 ? address.address2 + '\n' : ''}${address.city}, ${address.state || ''} ${address.postalCode}
${address.country}

Your package should arrive within 3-7 business days.

---
Bra Shop | Quality Comfort, Confident You
    `.trim();

    return {
        subject: `Your Order #${order.id} Has Shipped!`,
        html,
        text
    };
}

/**
 * Delivery Confirmation Email
 */
function deliveryConfirmation(order) {
    const address = order.shipping_address || {};

    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Order Has Been Delivered!</h1>
                </div>
                <div class="content">
                    <p>Hi ${address.firstName || 'there'},</p>
                    <p>Your order #${order.id} has been delivered!</p>
                    <p>We hope you love your new items. If you have any questions or concerns, please don't hesitate to reach out.</p>
                    <p style="margin-top: 30px;">Thank you for shopping with us!</p>
                </div>
                <div class="footer">
                    <p>Bra Shop | Quality Comfort, Confident You</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
YOUR ORDER HAS BEEN DELIVERED!

Hi ${address.firstName || 'there'},

Your order #${order.id} has been delivered!

We hope you love your new items. If you have any questions or concerns, please don't hesitate to reach out.

Thank you for shopping with us!

---
Bra Shop | Quality Comfort, Confident You
    `.trim();

    return {
        subject: `Order #${order.id} Delivered - Thank You!`,
        html,
        text
    };
}

module.exports = {
    orderConfirmation,
    shippingNotification,
    deliveryConfirmation
};
