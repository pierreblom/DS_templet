// Import all modules
// Note: In a real modular system, these would be proper ES6 imports,
// but for now we'll use the global objects created by each module

// Global products array
let products = [];

// Debug logging to terminal
function debugLog(message) {
    console.log(message);
    fetch(`/log?msg=${encodeURIComponent(message)}`).catch(() => { });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    debugLog('🚀 ShopBeha: Page loaded, initializing...');

    // Load products
    products = await window.ProductsModule.loadProducts();
    window.products = products;
    debugLog(`📦 ShopBeha: Loaded products: ${products.length} items`);

    // Initialize modules
    window.ModalModule.init();
    window.ModalModule.initAccountPopup();

    // Initialize UI
    window.UIModule.renderTrailFavorites(products);
    window.UIModule.populateProductLists(products);
    await window.CartModule.updateCartBadge();

    // Initialize promo field if present
    const promo = window.CartModule.loadPromo();
    const promoInput = document.getElementById('promoCode');
    if (promoInput && promo.code) promoInput.value = promo.code;

    debugLog('✅ ShopBeha: Initialization complete');
});

// Global aliases for HTML onclick attributes
window.openCart = () => window.UIModule.openCart();
window.closeModal = (id) => window.ModalModule.closeModal(id);
window.toggleNav = (state) => window.ModalModule.toggleNav(state);
window.openSearch = () => window.SearchModule.openSearch();
window.openCheckout = () => window.UIModule.openCheckout();
window.handleSignUp = () => window.openLoginModal('signup');
window.handleSignIn = () => window.openLoginModal('signin');
window.toggleAccountPopup = (e) => window.ModalModule.toggleAccountPopup(e);
window.handleProfile = () => handleProfileClick();
window.handleOrders = () => handleOrdersClick();

// UIModule needs these for cart interactions
window.decreaseCartQty = (id) => window.UIModule.decreaseQuantity(id);
window.increaseCartQty = (id) => window.UIModule.increaseQuantity(id);
window.removeLine = (id) => window.UIModule.removeFromCart(id);

// Functions are now handled by UIModule

// Cart and promo functions are now handled by CartModule and UIModule

// Form Handling
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', function (e) {
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
        window.ProductsModule.saveProducts(products);
        alert('Product added successfully!');
        window.ModalModule.closeModal('addProductModal');
        window.UIModule.populateProductLists(products);
        addProductForm.reset();
    });
}

// Checkout submit handler
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        alert('Order placed! A confirmation has been sent to your email.');
        await window.CartModule.clearCart();
        window.ModalModule.closeModal('checkoutModal');
    });
}

// Fix for SVG className.indexOf error caused by some browser extensions
/*
if (window.SVGAnimatedString && !SVGAnimatedString.prototype.indexOf) {
    SVGAnimatedString.prototype.indexOf = function () {
        return (this.baseVal || "").indexOf.apply(this.baseVal || "", arguments);
    };
}
*/
