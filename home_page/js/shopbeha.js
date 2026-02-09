/**
 * main.js
 * Common JavaScript for ShopBeha website
 * Handles Products, Cart, Modals, and Navigation
 */

// ==========================================
// 1. PRODUCT DATA (Mock Database)
// ==========================================

// 1. PRODUCT DATA
// ==========================================

let products = [];

// XSS Sanitization Helpers
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

function escapeJS(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

async function fetchProducts() {
    try {
        const API_BASE = (window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3030'))
            ? 'http://localhost:3030'
            : '';
        const response = await fetch(`${API_BASE}/api/v1/products?inStock=true&limit=100`);
        if (response.ok) {
            const data = await response.json();
            const apiProducts = data.products || [];
            if (apiProducts.length > 0) {
                products = apiProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: parseFloat(p.price),
                    rating: parseFloat(p.rating),
                    category: p.category,
                    isTrailFavorite: p.is_trail_favorite,
                    image: p.image_url || '/images/placeholder.png', // Fallback
                    hoverImage: p.hover_image_url || p.image_url || '/images/placeholder.png'
                }));
                // Save to local storage for offline/cache if needed, or just keep in memory
                // localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                console.log(`Loaded ${products.length} products from API`);

                // Trigger UI updates
                if (typeof renderCart === 'function') renderCart();
                // Check for homepage specific functions
                if (typeof window.renderTrailFavorites === 'function') {
                    window.renderTrailFavorites();
                }
                if (typeof window.populateProductLists === 'function') {
                    window.populateProductLists();
                }

                if (window.UIModule && window.UIModule.populateProductLists) {
                    window.UIModule.populateProductLists(products);
                }
            }
        }
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
}

// Initialize Products on Load
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});


// ==========================================
// 2. CART LOGIC
// ==========================================


// ==========================================
// 2. CART LOGIC (Delegated to CartModule)
// ==========================================

// NOTE: CART_KEY is defined in CartModule

async function loadCart() {
    return await CartModule.loadCart();
}

function updateCartBadge() {
    CartModule.updateCartBadge();
}

async function addToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    await CartModule.addToCart(productId, qty);
    // UI Feedback is handled by button change in quickAdd/product page, 
    // but here we just ensure data is saved
    return product;
}

async function quickAdd(productId) {
    await addToCart(productId);
    openCart();
}

async function increaseQty(index) {
    const cart = await CartModule.loadCart();
    const line = cart[index];
    if (!line) return;
    await CartModule.updateQuantity(line.productId, (line.quantity || 1) + 1, line.options);
    renderCart(); // Re-render UI
}

async function decreaseQty(index) {
    const cart = await CartModule.loadCart();
    const line = cart[index];
    if (!line) return;
    const newQty = (line.quantity || 1) - 1;
    if (newQty < 1) {
        // Remove logic
        await CartModule.removeFromCart(line.productId, line.options);
    } else {
        await CartModule.updateQuantity(line.productId, newQty, line.options);
    }
    renderCart();
}

async function removeLine(index) {
    const cart = await CartModule.loadCart();
    const line = cart[index];
    if (!line) return;
    await CartModule.removeFromCart(line.productId, line.options);
    renderCart();
}

// Promo & Shipping Logic
const PROMO_KEY = 'beha_promo_v1';
function loadPromo() {
    try { return JSON.parse(localStorage.getItem(PROMO_KEY)) || { code: '', discountRate: 0 }; } catch (_) { return { code: '', discountRate: 0 }; }
}
function savePromo(state) {
    try { localStorage.setItem(PROMO_KEY, JSON.stringify(state)); } catch (_) { }
}
function computeShipping(subtotal) {
    if (subtotal <= 0) return 0;
    const regionEl = document.getElementById('shippingRegion');
    const region = regionEl ? regionEl.value : 'sa';
    if (region === 'intl') return 300;
    return subtotal >= 900 ? 0 : 60;
}

async function applyPromo() {
    const input = document.getElementById('promoCode');
    if (!input) return;

    const code = (input.value || '').trim().toUpperCase();

    // Calculate current subtotal
    const cart = await loadCart();
    let subtotal = 0;
    cart.forEach((line) => {
        const product = products.find(p => p.id === line.productId);
        if (product) {
            subtotal += product.price * (line.quantity || 1);
        }
    });

    // Use CartModule's server-side validation
    const result = await CartModule.applyPromo(code, subtotal);

    if (result.success) {
        window.showNotification(result.message, 'success');
    } else {
        window.showNotification(result.message, 'error');
    }

    renderCart();
}

async function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const shippingEl = document.getElementById('shippingAmount');
    const shippingLineEl = document.getElementById('cartShipping');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const promoInput = document.getElementById('promoCode');

    if (!container || !totalEl) return;

    const cart = await loadCart();
    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((line, index) => {
        const product = products.find(p => p.id === line.productId);
        if (!product) return;
        const lineTotal = product.price * (line.quantity || 1);
        subtotal += lineTotal;

        // Check for Options
        let metaHtml = '';
        if (line.options) {
            const parts = [];
            if (line.options.size) parts.push(`Size: ${line.options.size.toUpperCase()}`);
            if (line.options.color) {
                // Capitalize first letter of color
                const colorName = line.options.color.charAt(0).toUpperCase() + line.options.color.slice(1);
                parts.push(`Color: ${colorName}`);
            }
            if (parts.length > 0) {
                metaHtml = `<div class="cart-item-meta" style="font-size: 0.85rem; color: #666; margin-top: 4px;">${parts.join(' | ')}</div>`;
            }
        }

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${product.image}" alt="${escapeHTML(product.name)}" class="cart-item-img" loading="lazy">
            <div class="cart-item-details">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div class="cart-item-name">${escapeHTML(product.name)}</div>
                    <button class="remove-btn" onclick="removeLine(${index})" aria-label="Remove ${escapeHTML(product.name)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                ${metaHtml}
                <div class="cart-item-bottom">
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="decreaseQty(${index})">-</button>
                        <span>${line.quantity || 1}</span>
                        <button class="qty-btn" onclick="increaseQty(${index})">+</button>
                    </div>
                    <div class="cart-item-price">R ${lineTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
        container.appendChild(row);
    });

    const promo = loadPromo();
    if (promoInput && !promoInput.value) promoInput.value = promo.code || ''; // Don't overwrite if user is typing

    const discount = promo.discountRate ? subtotal * promo.discountRate : 0;
    const shipping = computeShipping(subtotal - discount);

    if (shippingEl) shippingEl.textContent = `Shipping: R ${shipping.toFixed(2)}`;
    if (shippingLineEl) shippingLineEl.textContent = `R ${shipping.toFixed(2)}`;
    if (subtotalEl) subtotalEl.textContent = `R ${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `- R ${discount.toFixed(2)}`;

    const total = Math.max(0, subtotal - discount) + shipping;
    totalEl.textContent = `R ${total.toFixed(2)}`;

    if (checkoutBtn) {
        const isEmpty = subtotal <= 0;
        checkoutBtn.disabled = isEmpty;
        checkoutBtn.style.opacity = isEmpty ? '0.6' : '1';
        checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    }
}

// ==========================================
// 3. MODAL LOGIC
// ==========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    if (modalId === 'cartModal') {
        modal.classList.add('show-right');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
    if (modalId === 'cartModal') {
        modal.classList.remove('show-right');
        document.body.style.overflow = '';
    }
}

function openCart() {
    openModal('cartModal');
    renderCart(); // Ensure cart is fresh
}

async function openCheckout() {
    const cart = await loadCart();
    if (!cart || cart.length === 0) {
        window.showNotification("Your cart is empty!", 'warning');
        return;
    }
    window.location.href = '/checkout.html';
}

function openSearch() {
    openModal('searchModal');
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
        searchInput.value = '';
        const results = document.getElementById('searchResults');
        if (results) results.innerHTML = '';
        searchInput.oninput = performSearch;
    }
}

function openAccount() {
    openModal('accountModal');
}

// Close modals when clicking outside
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        if (e.target.id === 'cartModal') {
            e.target.classList.remove('show-right');
            document.body.style.overflow = '';
        }
    }
});


// ==========================================
// 4. NAVIGATION & UX LOGIC
// ==========================================

function toggleNav(forceState) {
    const nav = document.querySelector('.nav-links'); // Match front_page.css logic (mobile menu is usually a .nav-links.open)
    const overlay = document.getElementById('mobileOverlay');

    // Fallback if structure is slightly different (e.g. if we used the header.html logic)
    // In header.html I used `nav > ul.nav-links`.

    if (!nav && !overlay) return;

    const isOpen = typeof forceState === 'boolean' ? forceState : !nav.classList.contains('open');
    if (isOpen) {
        nav.classList.add('open');
        overlay?.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        nav.classList.remove('open');
        overlay?.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function openProductPage(productId, productName, productPrice) {
    const encodedName = encodeURIComponent(productName);
    const url = `/Select/select.html?id=${productId}&name=${encodedName}&price=${productPrice}`;
    window.location.href = url;
}

// Category page removed - function disabled
// function openCategoryPage(category) {
//     const url = `/category_page.html?category=${category}`;
//     window.location.href = url;
// }

// Search Logic
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    if (query.length === 0) {
        searchResults.innerHTML = '';
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    searchResults.innerHTML = '';
    if (filteredProducts.length === 0) {
        searchResults.innerHTML = '<div style="padding:1rem; text-align:center; color:#666;">No products found.</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = () => {
            closeModal('searchModal');
            openProductPage(product.id, product.name, product.price);
        };
        const safeName = escapeHTML(product.name);
        resultItem.innerHTML = `
            <div style="font-size:1.5rem;">${getCategoryIcon(product.category)}</div>
            <div>
                <div style="font-weight:600;">${safeName}</div>
                <div style="color:#888;">R ${product.price.toFixed(2)}</div>
            </div>
        `;
        searchResults.appendChild(resultItem);
    });
}

function getCategoryIcon(category) {
    switch (category) {
        case 'bras': return '👙';
        case 'bottoms': return '🩲';
        case 'maternity': return '🤰';
        case 'shapewear': return '⏳';
        default: return '🛍️';
    }
}


// ==========================================
// 5. INITIALIZATION
// ==========================================

// Toggle Terms & Policies Menu
function toggleTermsMenu() {
    const menu = document.getElementById('terms-menu');
    const overlay = document.getElementById('terms-overlay');

    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 ShopBeha: Common JS initialized');
    updateCartBadge();

    // Register Service Worker for caching images
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
