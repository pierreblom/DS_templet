/**
 * Pricing Utilities
 * Shared logic for calculating totals, discounts, and shipping
 */

// Promo codes definition
const VALID_PROMOS = {
    'ROOTED15': {
        code: 'ROOTED15',
        discountRate: 0.15,
        description: '15% off your order',
        active: true,
        minPurchase: 0,
        maxDiscount: null,
        expiresAt: null
    }
};

/**
 * Calculate shipping cost
 */
function calculateShipping(subtotal, region = 'sa') {
    if (subtotal <= 0) return 0;
    if (region === 'intl') return 300;
    return subtotal >= 900 ? 0 : 60;
}

/**
 * Calculate promo discount
 */
function calculatePromoDiscount(promoCode, subtotal) {
    if (!promoCode) return 0;

    const upperCode = promoCode.trim().toUpperCase();
    const promo = VALID_PROMOS[upperCode];

    if (!promo || !promo.active) return 0;

    // Check expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return 0;
    }

    // Check minimum purchase
    if (promo.minPurchase && subtotal < promo.minPurchase) {
        return 0;
    }

    let discount = subtotal * promo.discountRate;

    if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
    }

    return Math.round(discount * 100) / 100;
}

/**
 * Get active promo details
 */
function getPromo(code) {
    if (!code) return null;
    return VALID_PROMOS[code.toUpperCase()] || null;
}

module.exports = {
    VALID_PROMOS,
    calculateShipping,
    calculatePromoDiscount,
    getPromo
};
