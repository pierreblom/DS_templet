/**
 * Account Module
 * Handles account popup and authentication functionality
 */

/**
 * Account Manager class
 */
class AccountManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize account functionality
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind account-related events
     */
    bindEvents() {
        // Account popup toggle
        const accountBtn = document.querySelector('[aria-label="User account"]');
        if (accountBtn) {
            accountBtn.addEventListener('click', (e) => this.togglePopup(e));
        }

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });
    }

    /**
     * Toggle account popup
     */
    togglePopup(event) {
        if (event) event.stopPropagation();

        const popup = document.getElementById('accountPopup');
        if (popup) {
            const isVisible = popup.classList.contains('show');

            // Close all other popups first
            this.closeAllPopups();

            if (!isVisible) {
                popup.classList.add('show');
            }
        }
    }

    /**
     * Handle clicking outside popup
     */
    handleOutsideClick(event) {
        const popup = document.getElementById('accountPopup');
        const accountBtn = document.querySelector('[aria-label="User account"]');

        if (popup && popup.classList.contains('show')) {
            if (!popup.contains(event.target) && (!accountBtn || !accountBtn.contains(event.target))) {
                popup.classList.remove('show');
            }
        }
    }

    /**
     * Close all popups
     */
    closeAllPopups() {
        const popups = document.querySelectorAll('.account-popup');
        popups.forEach(popup => popup.classList.remove('show'));
    }

    /**
     * Handle sign in action
     */
    handleSignIn() {
        alert('Sign in functionality coming soon!');
        this.closeAllPopups();
    }

    /**
     * Handle sign up action
     */
    handleSignUp() {
        alert('Sign up functionality coming soon!');
        this.closeAllPopups();
    }

    /**
     * Handle orders action
     */
    handleOrders() {
        window.location.href = '/orders.html';
        this.closeAllPopups();
    }

    /**
     * Handle profile action
     */
    handleProfile() {
        window.location.href = '/profile.html';
        this.closeAllPopups();
    }
}

// Create account manager instance
const accountManager = new AccountManager();

// Make globally available
window.accountManager = accountManager;

// Legacy functions for backward compatibility
function toggleAccountPopup(event) {
    accountManager.togglePopup(event);
}

function handleSignIn() {
    accountManager.handleSignIn();
}

function handleSignUp() {
    accountManager.handleSignUp();
}

function handleOrders() {
    accountManager.handleOrders();
}

function handleProfile() {
    accountManager.handleProfile();
}