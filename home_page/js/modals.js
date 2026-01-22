// Modal Module - Handles modal operations and management
const ModalModule = {
    // Open a modal by ID
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    // Close a modal by ID
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = '';
    },

    // Initialize modal event listeners
    init() {
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.id === 'cartModal' || e.target.classList.contains('modal')) {
                this.closeModal(e.target.id || 'cartModal');
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                });
            }
        });
    },

    // Toggle mobile navigation
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
    },

    // Toggle account popup
    toggleAccountPopup(event) {
        if (event) event.stopPropagation();
        const popup = document.getElementById('accountPopup');
        if (popup) {
            popup.classList.toggle('show');
        }
    },

    // Initialize account popup close handler
    initAccountPopup() {
        document.addEventListener('click', (event) => {
            const popup = document.getElementById('accountPopup');
            const userBtn = document.querySelector('[aria-label="User account"]');

            if (popup && popup.classList.contains('show')) {
                if (!popup.contains(event.target) && (!userBtn || !userBtn.contains(event.target))) {
                    popup.classList.remove('show');
                }
            }
        });
    }
};

// Export for use in other modules
window.ModalModule = ModalModule;