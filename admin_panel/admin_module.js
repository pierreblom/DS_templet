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
    async handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const errorElement = document.getElementById('loginError');

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem(this.AUTH_KEY, 'authenticated');
                this.showDashboard();
            } else {
                if (errorElement) {
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'Login failed. Please check credentials.';
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = 'Connection error.';
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

        // Load data and render
        Promise.all([
            this.loadProducts(),
            this.loadCustomers()
        ]).then(() => {
            this.renderDashboard();
        });
    },

    // Switch between tabs
    switchTab(tabName) {
        // Hide all views
        const views = document.querySelectorAll('.admin-view');
        views.forEach(view => view.style.display = 'none');

        // Show selected view
        const selectedView = document.getElementById(`view-${tabName}`);
        if (selectedView) selectedView.style.display = 'block';

        // Update nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        const activeNav = document.getElementById(`nav-${tabName}`);
        if (activeNav) activeNav.classList.add('active');

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                'dashboard': 'Dashboard',
                'products': 'Products',
                'customers': 'Customers'
            };
            pageTitle.textContent = titles[tabName] || 'Dashboard';
        }

        // Render specific content if needed
        if (tabName === 'products') {
            this.renderProductsTable();
        } else if (tabName === 'customers') {
            this.renderCustomersTable();
        }
    },

    // Logout admin
    logout() {
        localStorage.removeItem(this.AUTH_KEY);
        location.reload();
    },

    // Load products from API
    async loadProducts() {
        try {
            const response = await fetch('/api/v1/products?limit=100');
            const data = await response.json();
            window.products = data.products || [];
            return window.products;
        } catch (error) {
            console.error('Failed to load products:', error);
            window.products = [];
            return [];
        }
    },

    // Load customers from API
    async loadCustomers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users?limit=100', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            window.customers = data.users || [];
            return window.customers;
        } catch (error) {
            console.error('Failed to load customers:', error);
            window.customers = [];
            return [];
        }
    },

    // Create new product via API
    async createProduct(productData) {
        try {
            const response = await fetch('/api/v1/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Check if token exists or handle auth
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Failed to create product');
            await this.loadProducts();
            this.renderDashboard();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        }
    },

    // Update product via API
    async updateProduct(id, productData) {
        try {
            const response = await fetch(`/api/v1/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Failed to update product');
            await this.loadProducts();
            this.renderDashboard();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    },

    // Render admin dashboard
    renderDashboard() {
        this.updateStats();
        this.renderProductsTable();
    },

    // Update dashboard stats
    updateStats() {
        const products = window.products || [];
        const customers = window.customers || [];
        const totalProducts = products.length;
        const totalCustomers = customers.length;
        const trailFavorites = window.ProductsModule.getTrailFavorites(products).length;

        const totalProductsEl = document.getElementById('totalProducts');
        const totalCustomersEl = document.getElementById('totalCustomers');
        const trailFavoritesEl = document.getElementById('trailFavoritesCount');

        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
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
                    <span class="badge ${product.is_trail_favorite ? 'badge-yes' : 'badge-no'}">
                        ${product.is_trail_favorite ? 'Yes' : 'No'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-toggle" onclick="AdminModule.toggleTrailFavorite(${product.id})">
                            ${product.is_trail_favorite ? 'Remove ★' : 'Add ★'}
                        </button>
                        <button class="btn-delete" onclick="AdminModule.deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Render customers table
    renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const customers = window.customers || [];

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No customers found</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const tr = document.createElement('tr');
            const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A';
            const totalSpent = customer.totalSpent || 0;
            const joinedDate = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A';

            tr.innerHTML = `
                <td>${fullName}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>
                    <span class="badge ${customer.role === 'admin' ? 'badge-yes' : 'badge-no'}">
                        ${customer.role || 'customer'}
                    </span>
                </td>
                <td>R ${totalSpent.toFixed(2)}</td>
                <td>${joinedDate}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Toggle trail favorite status
    // Toggle trail favorite status
    async toggleTrailFavorite(productId) {
        const products = window.products || [];
        const product = products.find(p => p.id === productId);
        if (product) {
            // Toggle local state for immediate feedback/logic, but really we should just update
            const newState = !product.is_trail_favorite;
            await this.updateProduct(productId, { is_trail_favorite: newState });
        }
    },

    // Delete product
    // Delete product
    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`/api/v1/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to delete product');
                await this.loadProducts();
                this.renderDashboard();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
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
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            rating: Math.max(1, Math.min(5, parseFloat(document.getElementById('productRating').value))),
            category: document.getElementById('productCategory').value,
            is_trail_favorite: false
        };

        this.createProduct(newProduct).then(() => {
            alert('Product added successfully!');
            this.closeModal('addProductModal');
            form.reset();

            const uploadedImages = document.getElementById('uploadedImages');
            if (uploadedImages) uploadedImages.innerHTML = '';
        });
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