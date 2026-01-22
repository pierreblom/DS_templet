// Common utilities for product detail pages
// This file provides product-specific configuration and delegates to shared modules

// Product Configuration (for Select page) - Enhanced product details with colors and images
const productConfig = {
    1: {
        folder: "product_1_The_Snap_&_Go_Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "dark-gray", name: "Dark Gray" },
            { id: "gray", name: "Gray" },
            { id: "skin", name: "Skin" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "1.png", alt: "Dark Gray Bra" },
            { src: "3.png", alt: "Bra View 3" },
            { src: "4.png", alt: "Bra View 4" }
        ]
    },
    2: {
        folder: "product_2_The_Ultimate_Coverage_Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "beige", name: "Beige" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "2.png", alt: "Bra View 2" },
            { src: "1.png", alt: "Bra View 1" },
            { src: "3.png", alt: "Bra View 3" }
        ]
    },
    3: {
        folder: "product_3_The_Posture_Perfect_Shaper",
        colors: [
            { id: "black", name: "Black" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "3.png", alt: "Bra View 3" },
            { src: "2.png", alt: "Bra View 2" },
            { src: "1.png", alt: "Bra View 1" }
        ]
    },
    4: {
        folder: "product_4_The_High_Compression_Bodysuit",
        colors: [
            { id: "black", name: "Black" },
            { id: "beige", name: "Beige" }
        ],
        images: [
            { src: "black.png", alt: "Black Bodysuit", id: "mainImage" },
            { src: "3.png", alt: "Bodysuit View 3" },
            { src: "4.png", alt: "Bodysuit View 4" },
            { src: "2.png", alt: "Bodysuit View 2" }
        ]
    },
    5: {
        folder: "product_5_The_Glimmer_Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "gray", name: "Gray" },
            { id: "khaki", name: "Khaki" },
            { id: "beige", name: "Beige" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "2.png", alt: "Bra View 2" },
            { src: "3.png", alt: "Bra View 3" },
            { src: "1.png", alt: "Bra View 1" }
        ]
    },
    6: {
        folder: "product_6_The_Active_Zip_Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "gray", name: "Gray" },
            { id: "white", name: "White" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "1.png", alt: "Bra View 1" },
            { src: "1.png", alt: "Bra View 1" },
            { src: "3.jpg", alt: "Bra View 3" }
        ]
    },
    7: {
        folder: "product_7_The_24.7 Seamless Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "blue", name: "Blue" },
            { id: "green", name: "Green" },
            { id: "khaki", name: "Khaki" },
            { id: "gray", name: "Gray" }
        ],
        images: [
            { src: "black.png", alt: "Black Bra", id: "mainImage" },
            { src: "3.png", alt: "Bra View 3" },
            { src: "2.png", alt: "Bra View 2" },
            { src: "1.png", alt: "Bra View 1" }
        ]
    },
    8: {
        folder: "product_8_The_Seamless_Soft_Bra",
        colors: [
            { id: "black", name: "Black" },
            { id: "gray", name: "Gray" },
            { id: "beige", name: "Beige" },
            { id: "white", name: "White" }
        ],
        images: [
            { src: "black.jpg", alt: "Black Bra", id: "mainImage" },
            { src: "4.png", alt: "Bra View 4" },
            { src: "1.png", alt: "Bra View 1" },
            { src: "2.png", alt: "Bra View 2" }
        ]
    }
};

// Cart Functionality
const CART_KEY = 'beha_cart_v1';

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (_) { }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const cart = loadCart();
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (count > 0) {
        badge.textContent = String(count);
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function addToCart(product, quantity = 1, options = {}) {
    let cart = loadCart();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
        cart.push({
            productId: product.id,
            quantity: quantity,
            name: product.name,
            price: product.price,
            image: product.image,
            ...options // color, size, etc.
        });
    }

    saveCart(cart);
    updateCartBadge();
    openCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const shippingEl = document.getElementById('shippingAmount');
    const shippingLineEl = document.getElementById('cartShipping');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container || !totalEl) return;

    const cart = loadCart();
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:#999;">Your cart is empty</div>';
    }

    let subtotal = 0;

    cart.forEach(line => {
        // If line doesn't have name/price (legacy cart), try to find it in allProducts
        if (!line.name || !line.price) {
            const product = allProducts.find(p => p.id === line.productId);

// Wrapper functions that delegate to shared modules
// This eliminates code duplication and follows DRY principles

// Cart operations - delegate to CartModule
async function loadCart() {
    return await window.CartModule.loadCart();
}

async function saveCart(cart) {
    return await window.CartModule.saveCart(cart);
}

async function updateCartBadge() {
    return await window.CartModule.updateCartBadge();
}

async function addToCart(product, quantity = 1, options = {}) {
    // Convert product object to cart item format
    const cartItem = {
        productId: product.id,
        quantity: quantity,
        name: product.name,
        price: product.price,
        image: product.image,
        ...options // color, size, etc.
    };

    // Use CartModule to add the item
    const currentCart = await window.CartModule.loadCart();
    const existingItem = currentCart.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
        currentCart.push(cartItem);
    }

    await window.CartModule.saveCart(currentCart);
    await window.CartModule.updateCartBadge();
}

// UI operations - delegate to UIModule
async function renderCart() {
    const products = window.products || window.ProductsModule.loadProducts();
    return await window.UIModule.renderCart(products);
}

async function increaseQty(productId) {
    return await window.UIModule.increaseQuantity(productId);
}

async function decreaseQty(productId) {
    return await window.UIModule.decreaseQuantity(productId);
}

async function removeLine(productId) {
    return await window.UIModule.removeFromCart(productId);
}

// Modal operations - delegate to ModalModule
function openCheckout() {
    return window.UIModule.openCheckout();
}

function toggleAccountPopup(event) {
    return window.ModalModule.toggleAccountPopup(event);
}

// Utility functions - delegate to ProductsModule
function getCategoryIcon(category) {
    return window.ProductsModule.getCategoryIcon(category);
}

// Product operations
function getProductConfig(productId) {
    return productConfig[productId];
}

// Initialization - ensure modules are loaded
document.addEventListener('DOMContentLoaded', async function () {
    // Wait for modules to be available
    if (window.CartModule) {
        await window.CartModule.updateCartBadge();
    }

    // Initialize modal handlers if ModalModule is available
    if (window.ModalModule) {
        window.ModalModule.initAccountPopup();
    }
});
