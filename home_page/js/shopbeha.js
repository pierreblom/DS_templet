/**
 * main.js
 * Common JavaScript for ShopBeha website
 * Handles Products, Cart, Modals, and Navigation
 */

// ==========================================
// 1. PRODUCT DATA (Mock Database)
// ==========================================

let products = [
    {
        id: 1,
        name: "Deep V Backless Body Shaper Bra",
        price: 359.00,
        rating: 4.8,
        category: "shapewear",
        isTrailFavorite: true,
        image: "images/product_1_Deep_V_Backless_Body_Shaper_Bra/1.png",
        hoverImage: "images/product_1_Deep_V_Backless_Body_Shaper_Bra/2.png"
    },
    {
        id: 2,
        name: "Sculpt & Contour Body Shaper",
        price: 459.00,
        rating: 5.0,
        category: "shapewear",
        isTrailFavorite: true,
        image: "images/product_2_Sculpt_&_Contour_Body_Shaper/1.png",
        hoverImage: "images/product_2_Sculpt_&_Contour_Body_Shaper/2.png"
    },
    {
        id: 3,
        name: "The Sculpt & Smooth Minimizer",
        price: 520.00,
        rating: 4.9,
        category: "bras",
        isTrailFavorite: true,
        image: "images/product_3_The_Sculpt_&_Smooth_Minimizer/1.png",
        hoverImage: "images/product_3_The_Sculpt_&_Smooth_Minimizer/2.png"
    },
    {
        id: 4,
        name: "Primary Choice",
        price: 899.00,
        rating: 4.7,
        category: "shapewear",
        isTrailFavorite: true,
        image: "images/product_4_Primary_Choice/1.png",
        hoverImage: "images/product_4_Primary_Choice/2.png"
    },
    {
        id: 5,
        name: "Aura Front-Closure Lace Bra",
        price: 450.00,
        rating: 4.6,
        category: "bras",
        isTrailFavorite: true,
        image: "images/product_5_Aura_Front-Closure_Lace_Bra/1.png",
        hoverImage: "images/product_5_Aura_Front-Closure_Lace_Bra/2.png"
    },
    {
        id: 6,
        name: "The Zenith High-Impact Front-Zip Sports Bra",
        price: 399.00,
        rating: 4.5,
        category: "bras",
        isTrailFavorite: true,
        image: "images/product_6_The_Zenith_High-Impact_Front-Zip_Sports_Bra/1.png",
        hoverImage: "images/product_6_The_Zenith_High-Impact_Front-Zip_Sports_Bra/2.png"
    },
    {
        id: 7,
        name: "The Seamless Silhouette Full-Coverage Bra",
        price: 350.00,
        rating: 4.9,
        category: "bras",
        isTrailFavorite: true,
        image: "images/product_7_The_Seamless_Silhouette_Full-Coverage_Bra/1.png",
        hoverImage: "images/product_7_The_Seamless_Silhouette_Full-Coverage_Bra/2.png"
    },
    {
        id: 8,
        name: "The Sculpt-Soft Jelly Lift Bra",
        price: 299.00,
        rating: 5.0,
        category: "bras",
        isTrailFavorite: true,
        image: "images/product_8_The_Sculpt-Soft_Jelly_Lift_Bra/1.png",
        hoverImage: "images/product_8_The_Sculpt-Soft_Jelly_Lift_Bra/2.png"
    }
];

const PRODUCTS_KEY = 'auraflex_products_v2';

function loadProductsFromStorage() {
    try {
        const raw = localStorage.getItem(PRODUCTS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
    } catch (_) {
        return null;
    }
}

function saveProductsToStorage() {
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (_) {
        // ignore storage errors
    }
}

// Initialize Products on Load
const storedProducts = loadProductsFromStorage();
if (storedProducts) {
    products = storedProducts;
} else {
    // Save defaults to storage so edits persist
    saveProductsToStorage();
}


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

async function increaseQty(productId) {
    const cart = await CartModule.loadCart();
    const line = cart.find(l => l.productId === productId);
    if (!line) return;
    await CartModule.updateQuantity(productId, (line.quantity || 1) + 1);
    renderCart(); // Re-render UI
}

async function decreaseQty(productId) {
    const cart = await CartModule.loadCart();
    const line = cart.find(l => l.productId === productId);
    if (!line) return;
    const newQty = (line.quantity || 1) - 1;
    if (newQty < 1) {
        // Option: Remove or stay at 1? usually stay at 1 or remove. 
        // Current logic was stay at 1. CartModule.updateQuantity handles max(1, qty)
        await CartModule.updateQuantity(productId, newQty);
    } else {
        await CartModule.updateQuantity(productId, newQty);
    }
    renderCart();
}

async function removeLine(productId) {
    await CartModule.removeFromCart(productId);
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
    const regionEl = document.getElementById('shippingRegion');
    const region = regionEl ? regionEl.value : 'sa';
    if (region === 'intl') return 300;
    return subtotal >= 1000 ? 0 : 60;
}

function applyPromo() {
    const input = document.getElementById('promoCode');
    if (!input) return;
    const code = (input.value || '').trim().toUpperCase();
    if (code === 'ROOTED15') {
        savePromo({ code, discountRate: 0.15 });
        alert('Promo code applied: 15% off');
    } else if (code === '') {
        savePromo({ code: '', discountRate: 0 });
    } else {
        alert('Invalid promo code');
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

    cart.forEach(line => {
        const product = products.find(p => p.id === line.productId);
        if (!product) return;
        const lineTotal = product.price * (line.quantity || 1);
        subtotal += lineTotal;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div class="cart-item-name">${product.name}</div>
                    <button class="remove-btn" onclick="removeLine(${product.id})" aria-label="Remove ${product.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <!-- <div class="cart-item-meta">Size: M | Color: Nude</div> -->
                <div class="cart-item-bottom">
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="decreaseQty(${product.id})">-</button>
                        <span>${line.quantity || 1}</span>
                        <button class="qty-btn" onclick="increaseQty(${product.id})">+</button>
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
        alert("Your cart is empty!");
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

function openCategoryPage(category) {
    const url = `/category_page.html?category=${category}`;
    window.location.href = url;
}

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
        resultItem.innerHTML = `
            <div style="font-size:1.5rem;">${getCategoryIcon(product.category)}</div>
            <div>
                <div style="font-weight:600;">${product.name}</div>
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
});
