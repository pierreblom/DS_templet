/**
 * Modals Module
 * Handles modal opening, closing, and management
 */

/**
 * Modal Manager class
 */
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    /**
     * Initialize modal functionality
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind modal-related events
     */
    bindEvents() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    /**
     * Open a modal by ID
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.activeModal = modalId;

        // Focus management for accessibility
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        return true;
    }

    /**
     * Close a modal by ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.style.display = 'none';
        document.body.style.overflow = '';

        if (this.activeModal === modalId) {
            this.activeModal = null;
        }

        return true;
    }

    /**
     * Close the currently active modal
     */
    closeActiveModal() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    /**
     * Check if a modal is currently open
     */
    isModalOpen(modalId) {
        const modal = document.getElementById(modalId);
        return modal && modal.style.display === 'flex';
    }
}

// Create modal manager instance
const modalManager = new ModalManager();

// Make globally available
window.modalManager = modalManager;

// Legacy functions for backward compatibility
function openModal(modalId) {
    return modalManager.openModal(modalId);
}

function closeModal(modalId) {
    return modalManager.closeModal(modalId);
}