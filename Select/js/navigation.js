/**
 * Navigation Module
 * Handles navigation and mobile menu functionality
 */

/**
 * Navigation class for managing nav operations
 */
class NavigationManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind navigation events
     */
    bindEvents() {
        // Hamburger menu toggle
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleNav());
        }

        // Mobile overlay click
        const overlay = document.getElementById('mobileOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.toggleNav(false));
        }
    }

    /**
     * Toggle mobile navigation menu
     */
    toggleNav(forceState) {
        const nav = document.querySelector('.nav-links');
        const overlay = document.getElementById('mobileOverlay');

        if (!nav || !overlay) return;

        const isOpen = typeof forceState === 'boolean' ? forceState : !nav.classList.contains('open');

        if (isOpen) {
            nav.classList.add('open');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            nav.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// Create navigation manager instance
const navigationManager = new NavigationManager();

// Make globally available
window.navigationManager = navigationManager;

// Legacy function for backward compatibility
function toggleNav(forceState) {
    navigationManager.toggleNav(forceState);
}