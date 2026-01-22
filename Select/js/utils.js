/**
 * Utils Module
 * Common utility functions
 */

/**
 * Utility functions class
 */
class Utils {
    /**
     * Format currency
     */
    static formatCurrency(amount, currency = 'R') {
        return `${currency} ${parseFloat(amount).toFixed(2)}`;
    }

    /**
     * Debounce function calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show temporary feedback message
     */
    static showFeedback(element, message, duration = 2000, success = true) {
        if (!element) return;

        const originalText = element.innerHTML;
        element.innerHTML = message;
        element.style.background = success ? '#28a745' : '#dc3545';

        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.background = '';
        }, duration);
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Get URL parameters
     */
    static getUrlParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    /**
     * Set URL parameter
     */
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Capitalize first letter
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Truncate text
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Safe DOM element update (checks existence before updating)
     */
    static updateElement(selector, value, property = 'textContent') {
        const element = document.querySelector(selector);
        if (element) {
            element[property] = value;
        }
    }

    /**
     * Batch update multiple DOM elements
     */
    static updateElements(updates) {
        updates.forEach(({ selector, value, property = 'textContent' }) => {
            this.updateElement(selector, value, property);
        });
    }

    /**
     * Get element by ID with null check
     */
    static getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Set multiple CSS properties on an element
     */
    static setStyles(element, styles) {
        if (!element) return;
        Object.assign(element.style, styles);
    }

    /**
     * Toggle CSS classes on an element
     */
    static toggleClass(element, className, force) {
        if (!element) return;
        element.classList.toggle(className, force);
    }
}

// Make Utils globally available
window.Utils = Utils;