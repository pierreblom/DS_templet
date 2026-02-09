/**
 * Cart Module
 * Handles all cart-related functionality
 */

const CART_KEY = 'beha_cart_v1';

/**
 * Cart class for managing cart operations
 */
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        } catch (e) {
            console.error('Failed to load cart:', e);
            return [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            this.cart = cart;
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }

    /**
     * Add item to cart
     */
    addItem(productId, itemData) {
        const existingItem = this.cart.find(item => item.productId === productId);
        const quantity = itemData.quantity || 1;

        if (existingItem) {
            existingItem.quantity = this.getSafeQuantity(existingItem.quantity) + quantity;
        } else {
            this.cart.push({
                productId: productId,
                quantity: quantity,
                name: itemData.name,
                price: itemData.price,
                color: itemData.color,
                size: itemData.size,
                image: itemData.image
            });
        }

        this.updateCartState();
        return true;
    }

    /**
     * Get safe quantity (default to 1)
     */
    getSafeQuantity(quantity) {
        return quantity || 1;
    }

    /**
     * Remove item from cart
     */
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.updateCartState();
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.updateCartState();
            }
        }
    }

    /**
     * Get cart total
     */
    getTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? (subtotal >= 900 ? 0 : 60) : 0;
        return {
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    /**
     * Update cart badge display
     */
    updateBadge() {
        const totalItems = this.getItemCount();
        const badge = Utils.getElement('cartBadge');

        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems;
                Utils.setStyles(badge, { display: 'flex' });
            } else {
                Utils.setStyles(badge, { display: 'none' });
            }
        }
    }

    /**
     * Update cart state (combines save and badge update)
     */
    updateCartState() {
        this.saveCart(this.cart);
        this.updateBadge();
    }

    /**
     * Batch update multiple DOM elements
     */
    updateElements(updates) {
        Utils.updateElements(updates);
    }

    /**
     * Render cart items in modal
     */
    renderCart(allProducts = []) {
        const container = Utils.getElement('cartItems');
        const totalEl = Utils.getElement('cartTotal');
        const shippingEl = Utils.getElement('shippingAmount');
        const subtotalEl = Utils.getElement('cartSubtotal');
        const shippingLineEl = Utils.getElement('cartShipping');
        const discountEl = Utils.getElement('cartDiscount');
        const checkoutBtn = Utils.getElement('checkoutBtn');

        if (!container || !totalEl) return;

        container.innerHTML = '';

        if (this.cart.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:#999;">Your cart is empty</div>';
        } else {
            this.cart.forEach(line => {
                // Look up product info if missing
                const product = allProducts.find(p => p.id === line.productId);
                const name = line.name || (product ? product.name : 'Unknown Product');
                const price = line.price || (product ? product.price : 0);
                let image = line.image || (product ? product.image : '../images/product_1_The_Snap_&_Go_Bra/1.png');

                // Fix image path if it's relative to root
                if (image.startsWith('images/')) {
                    image = '../' + image;
                }

                const lineTotal = price * this.getSafeQuantity(line.quantity);

                const safeQuantity = this.getSafeQuantity(line.quantity);
                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <img src="${image}" alt="${name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div class="cart-item-name">${name}</div>
                            <button class="remove-btn" onclick="cartManager.removeItem(${line.productId})" aria-label="Remove ${name}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="cart-item-meta">Size: ${line.size || 'M'} | Color: ${line.color || 'Nude'}</div>
                        <div class="cart-item-bottom">
                            <div class="cart-qty-controls">
                                <button class="qty-btn" onclick="cartManager.updateQuantity(${line.productId}, ${safeQuantity - 1})">-</button>
                                <span>${safeQuantity}</span>
                                <button class="qty-btn" onclick="cartManager.updateQuantity(${line.productId}, ${safeQuantity + 1})">+</button>
                            </div>
                            <div class="cart-item-price">R ${lineTotal.toFixed(2)}</div>
                        </div>
                    </div>
                `;
                container.appendChild(row);
            });
        }

        const totals = this.getTotal();

        // Batch update all summary elements
        this.updateElements([
            { selector: '#shippingAmount', value: `Shipping: R ${totals.shipping.toFixed(2)}` },
            { selector: '#cartShipping', value: `R ${totals.shipping.toFixed(2)}` },
            { selector: '#cartSubtotal', value: `R ${totals.subtotal.toFixed(2)}` },
            { selector: '#cartDiscount', value: `- R 0.00` },
            { selector: '#cartTotal', value: `R ${totals.total.toFixed(2)}` }
        ]);

        if (checkoutBtn) {
            const isEmpty = totals.total <= 0;
            checkoutBtn.disabled = isEmpty;
            Utils.setStyles(checkoutBtn, {
                opacity: isEmpty ? '0.6' : '1',
                cursor: isEmpty ? 'not-allowed' : 'pointer'
            });
        }
    }

    /**
     * Quick add item to cart (used in move.html)
     */
    quickAdd(productId, name, price, quantity = 1) {
        return this.addItem(productId, { name, price, quantity });
    }

    /**
     * Get cart items count
     */
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + this.getSafeQuantity(item.quantity), 0);
    }
}

// Export for use in other modules
const cartManager = new CartManager();

// Make cartManager globally available
window.cartManager = cartManager;