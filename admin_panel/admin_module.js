// Admin Module - Handles admin-specific functionality
// Uses shared modules for common operations to follow DRY principles

const AdminModule = {
    // Admin-specific constants
    ADMIN_PASSWORD: 'admin123',
    STORAGE_KEY: 'beha_products_v1',
    AUTH_KEY: 'beha_admin_auth',

    // Initialize admin panel
    init() {
        this.checkAuth();
        this.setupLoginHandler();
    },

    // Setup login form handler
    setupLoginHandler() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    // Handle login attempt
    handleLogin() {
        const password = document.getElementById('adminPassword').value;
        const errorElement = document.getElementById('loginError');

        if (password === this.ADMIN_PASSWORD) {
            localStorage.setItem(this.AUTH_KEY, 'authenticated');
            this.showDashboard();
        } else {
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        }
    },

    // Check authentication status
    checkAuth() {
        const isAuth = localStorage.getItem(this.AUTH_KEY) === 'authenticated';
        if (isAuth) {
            this.showDashboard();
        } else {
            this.showLoginScreen();
        }
    },

    // Show login screen
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');

        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminDashboard) adminDashboard.style.display = 'none';
    },

    // Show admin dashboard
    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');

        if (loginScreen) loginScreen.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'flex';

        this.loadProducts();
        this.renderDashboard();
    },

    // Logout admin
    logout() {
        localStorage.removeItem(this.AUTH_KEY);
        location.reload();
    },

    // Load products using shared ProductsModule
    loadProducts() {
        // Use the shared ProductsModule for consistency
        window.products = window.ProductsModule.loadProducts();
        return window.products;
    },

    // Save products using shared ProductsModule
    saveProducts(products) {
        window.products = products;
        window.ProductsModule.saveProducts(products);
    },

    // Render admin dashboard
    renderDashboard() {
        this.updateStats();
        this.renderProductsTable();
    },

    // Update dashboard stats
    updateStats() {
        const products = window.products || [];
        const totalProducts = products.length;
        const trailFavorites = window.ProductsModule.getTrailFavorites(products).length;

        const totalProductsEl = document.getElementById('totalProducts');
        const trailFavoritesEl = document.getElementById('trailFavoritesCount');

        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (trailFavoritesEl) trailFavoritesEl.textContent = trailFavorites;
    },

    // Render products table
    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const products = window.products || [];

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>R ${product.price.toFixed(2)}</td>
                <td>${product.rating} ⭐</td>
                <td style="text-transform: capitalize;">${product.category}</td>
                <td>
                    <span class="badge ${product.isTrailFavorite ? 'badge-yes' : 'badge-no'}">
                        ${product.isTrailFavorite ? 'Yes' : 'No'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-toggle" onclick="AdminModule.toggleTrailFavorite(${product.id})">
                            ${product.isTrailFavorite ? 'Remove ★' : 'Add ★'}
                        </button>
                        <button class="btn-delete" onclick="AdminModule.deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Toggle trail favorite status
    toggleTrailFavorite(productId) {
        const products = window.products || [];
        const success = window.ProductsModule.addToTrailFavorites(products, productId) ||
                       window.ProductsModule.removeFromTrailFavorites(products, productId);

        if (success) {
            this.saveProducts(products);
            this.renderDashboard();
        }
    },

    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = window.products || [];
            const filteredProducts = products.filter(p => p.id !== productId);
            this.saveProducts(filteredProducts);
            this.renderDashboard();
        }
    },

    // Modal management - delegate to shared ModalModule
    openModal(modalId) {
        window.ModalModule.openModal(modalId);

        // Special handling for edit trail favorites modal
        if (modalId === 'editTrailFavoritesModal') {
            this.populateProductLists();
        }
    },

    closeModal(modalId) {
        window.ModalModule.closeModal(modalId);
    },

    // Populate product lists for trail favorites modal
    populateProductLists() {
        const availableProductsList = document.getElementById('available-products');
        const trailFavoritesList = document.getElementById('trail-favorites-list');

        if (!availableProductsList || !trailFavoritesList) return;

        availableProductsList.innerHTML = '';
        trailFavoritesList.innerHTML = '';

        const products = window.products || [];

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-list-item';
            productItem.innerHTML = `
                <span>${product.name} - R ${product.price.toFixed(2)}</span>
                <div class="product-list-actions">
                    ${product.isTrailFavorite ?
                        `<button class="btn-delete" onclick="AdminModule.removeFromTrailFavorites(${product.id})">Remove</button>` :
                        `<button class="btn-edit" onclick="AdminModule.addToTrailFavorites(${product.id})">Add</button>`
                    }
                </div>
            `;

            if (product.isTrailFavorite) {
                trailFavoritesList.appendChild(productItem);
            } else {
                availableProductsList.appendChild(productItem);
            }
        });
    },

    // Add to trail favorites
    addToTrailFavorites(productId) {
        const products = window.products || [];
        if (window.ProductsModule.addToTrailFavorites(products, productId)) {
            this.saveProducts(products);
            this.populateProductLists();
        }
    },

    // Remove from trail favorites
    removeFromTrailFavorites(productId) {
        const products = window.products || [];
        if (window.ProductsModule.removeFromTrailFavorites(products, productId)) {
            this.saveProducts(products);
            this.populateProductLists();
        }
    },

    // Save trail favorites
    saveTrailFavorites() {
        this.renderDashboard();
        this.closeModal('editTrailFavoritesModal');
        alert('Trail Favorites updated successfully!');
    },

    // Handle add product form
    handleAddProduct() {
        const form = document.getElementById('addProductForm');
        if (!form) return;

        const newProduct = {
            id: this.generateProductId(),
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            rating: Math.max(1, Math.min(5, parseFloat(document.getElementById('productRating').value))),
            category: document.getElementById('productCategory').value,
            isTrailFavorite: false
        };

        const products = window.products || [];
        products.push(newProduct);
        this.saveProducts(products);
        this.renderDashboard();

        alert('Product added successfully!');
        this.closeModal('addProductModal');
        form.reset();

        const uploadedImages = document.getElementById('uploadedImages');
        if (uploadedImages) uploadedImages.innerHTML = '';
    },

    // Generate unique product ID
    generateProductId() {
        const products = window.products || [];
        return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    },

    // Handle image upload - delegate to UIModule
    handleImageUpload(input) {
        window.UIModule.handleImageUpload(input);
    }
};

// Global functions for HTML onclick handlers
function logout() {
    AdminModule.logout();
}

function openModal(modalId) {
    AdminModule.openModal(modalId);
}

function closeModal(modalId) {
    AdminModule.closeModal(modalId);
}

function saveTrailFavorites() {
    AdminModule.saveTrailFavorites();
}

// Make AdminModule globally available
window.AdminModule = AdminModule;