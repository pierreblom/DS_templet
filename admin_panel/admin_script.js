// Admin Script - Simplified using AdminModule
// This follows DRY principles by using shared modules and focusing on admin-specific logic

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the admin module
    window.AdminModule.init();

    // Setup add product form handler
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function (e) {
            e.preventDefault();
            window.AdminModule.handleAddProduct();
        });
    }
});

// Modal and other admin functions are now handled by AdminModule

// All admin functionality is now handled by AdminModule
// This eliminates code duplication and follows DRY principles
