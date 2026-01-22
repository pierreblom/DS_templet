// Admin password (you should change this!)
const ADMIN_PASSWORD = 'admin123';

// Storage keys
const STORAGE_KEY = 'beha_products_v1';
const AUTH_KEY = 'beha_admin_auth';

// Products array
let products = [];

// Check authentication on load
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();

    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;

        if (password === ADMIN_PASSWORD) {
            localStorage.setItem(AUTH_KEY, 'authenticated');
            showDashboard();
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });
});

// Check if user is authenticated
function checkAuth() {
    const isAuth = localStorage.getItem(AUTH_KEY) === 'authenticated';
    if (isAuth) {
        showDashboard();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadProducts();
    renderDashboard();
}

// Logout
function logout() {
    localStorage.removeItem(AUTH_KEY);
    location.reload();
}

// Load products from storage
function loadProducts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            products = JSON.parse(raw);
        } else {
            // Default products
            products = [
                {
                    id: 1,
                    name: "Woodland High-Waisted Leggings",
                    price: 950.00,
                    rating: 4.8,
                    category: "leggings",
                    isTrailFavorite: true
                },
                {
                    id: 2,
                    name: "Canopy Support Bra",
                    price: 680.00,
                    rating: 5.0,
                    category: "bras",
                    isTrailFavorite: true
                },
                {
                    id: 3,
                    name: "Dawn Trail Tank",
                    price: 550.00,
                    rating: 4.7,
                    category: "tops",
                    isTrailFavorite: true
                },
                {
                    id: 4,
                    name: "Forest Ridge Jacket",
                    price: 1250.00,
                    rating: 4.9,
                    category: "outerwear",
                    isTrailFavorite: true
                },
                {
                    id: 5,
                    name: "Mountain Flow Leggings",
                    price: 890.00,
                    rating: 4.6,
                    category: "leggings",
                    isTrailFavorite: false
                },
                {
                    id: 6,
                    name: "Sunrise Yoga Bra",
                    price: 620.00,
                    rating: 4.5,
                    category: "bras",
                    isTrailFavorite: false
                }
            ];
            saveProducts();
        }
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

// Save products to storage
function saveProducts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
        console.error('Error saving products:', e);
    }
}

// Render dashboard
function renderDashboard() {
    updateStats();
    renderProductsTable();
}

// Update stats
function updateStats() {
    const totalProducts = products.length;
    const trailFavorites = products.filter(p => p.isTrailFavorite).length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('trailFavoritesCount').textContent = trailFavorites;
}

// Render products table
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

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
                    <button class="btn-toggle" onclick="toggleTrailFavorite(${product.id})">
                        ${product.isTrailFavorite ? 'Remove ★' : 'Add ★'}
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Toggle trail favorite
function toggleTrailFavorite(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.isTrailFavorite = !product.isTrailFavorite;
        saveProducts();
        renderDashboard();
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderDashboard();
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        if (modalId === 'editTrailFavoritesModal') {
            populateProductLists();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Populate product lists for trail favorites modal
function populateProductLists() {
    const availableProductsList = document.getElementById('available-products');
    const trailFavoritesList = document.getElementById('trail-favorites-list');

    if (!availableProductsList || !trailFavoritesList) return;

    availableProductsList.innerHTML = '';
    trailFavoritesList.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-list-item';
        productItem.innerHTML = `
            <span>${product.name} - R ${product.price.toFixed(2)}</span>
            <div class="product-list-actions">
                ${product.isTrailFavorite ?
                `<button class="btn-delete" onclick="removeFromTrailFavorites(${product.id})">Remove</button>` :
                `<button class="btn-edit" onclick="addToTrailFavorites(${product.id})">Add</button>`
            }
            </div>
        `;

        if (product.isTrailFavorite) {
            trailFavoritesList.appendChild(productItem);
        } else {
            availableProductsList.appendChild(productItem);
        }
    });
}

// Add to trail favorites
function addToTrailFavorites(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.isTrailFavorite = true;
        saveProducts();
        populateProductLists();
    }
}

// Remove from trail favorites
function removeFromTrailFavorites(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.isTrailFavorite = false;
        saveProducts();
        populateProductLists();
    }
}

// Save trail favorites
function saveTrailFavorites() {
    saveProducts();
    renderDashboard();
    closeModal('editTrailFavoritesModal');
    alert('Trail Favorites updated successfully!');
}

// Handle add product form
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const newProduct = {
                id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                rating: Math.max(1, Math.min(5, parseFloat(document.getElementById('productRating').value))),
                category: document.getElementById('productCategory').value,
                isTrailFavorite: false
            };

            products.push(newProduct);
            saveProducts();
            renderDashboard();

            alert('Product added successfully!');
            closeModal('addProductModal');

            // Reset form
            form.reset();
            const uploadedImages = document.getElementById('uploadedImages');
            if (uploadedImages) uploadedImages.innerHTML = '';
        });
    }
});

// Image upload handling
function handleImageUpload(input) {
    const uploadedImagesContainer = document.getElementById('uploadedImages');

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'uploaded-image';

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = function () {
                imageDiv.remove();
            };

            imageDiv.appendChild(img);
            imageDiv.appendChild(removeBtn);
            uploadedImagesContainer.appendChild(imageDiv);
        };

        reader.readAsDataURL(file);
    });
}

// Close modal when clicking outside
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
