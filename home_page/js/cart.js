// Cart Module - Handles cart operations with Supabase and localStorage fallback
const CartModule = {
    CART_KEY: 'beha_cart_v1',
    PROMO_KEY: 'beha_promo_v1',

    // Load cart from Supabase or localStorage
    async loadCart() {
        if (typeof supabaseClient !== 'undefined') {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session?.user) {
                    const { data: carts } = await supabaseClient
                        .from('carts')
                        .select('id, cart_items(product_id, quantity)')
                        .eq('user_id', session.user.id)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (carts) {
                        return carts.cart_items.map(item => ({
                            productId: item.product_id,
                            quantity: item.quantity
                        }));
                    }
                    return [];
                }
            } catch (error) {
                console.error('Error loading cart from Supabase:', error);
            }
        }

        // Fallback to localStorage
        try {
            const raw = localStorage.getItem(this.CART_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    },

    // Save cart to Supabase or localStorage
    async saveCart(cart) {
        if (typeof supabaseClient !== 'undefined') {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session?.user) {
                    let { data: cartData } = await supabaseClient
                        .from('carts')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (!cartData) {
                        const { data: newCart } = await supabaseClient
                            .from('carts')
                            .insert({ user_id: session.user.id })
                            .select()
                            .single();
                        cartData = newCart;
                    }

                    await supabaseClient.from('cart_items').delete().eq('cart_id', cartData.id);

                    if (cart.length > 0) {
                        const itemsToInsert = cart.map(item => ({
                            cart_id: cartData.id,
                            product_id: item.productId,
                            quantity: item.quantity
                        }));
                        await supabaseClient.from('cart_items').insert(itemsToInsert);
                    }
                    return;
                }
            } catch (error) {
                console.error('Error saving cart to Supabase:', error);
            }
        }

        // Fallback to localStorage
        try {
            localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    },

    // Get cart count
    getCartCount(cart) {
        return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },

    // Update cart badge
    async updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const cart = await this.loadCart();
        const count = this.getCartCount(cart);
        if (count > 0) {
            badge.textContent = String(count);
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    // Add item to cart
    async addToCart(productId, quantity = 1) {
        const cart = await this.loadCart();
        const existing = cart.find(i => i.productId === productId);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + quantity;
        } else {
            cart.push({ productId, quantity });
        }
        await this.saveCart(cart);
        await this.updateCartBadge();
        return cart;
    },

    // Update item quantity
    async updateQuantity(productId, quantity) {
        const cart = await this.loadCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            await this.saveCart(cart);
            await this.updateCartBadge();
        }
        return cart;
    },

    // Remove item from cart
    async removeFromCart(productId) {
        let cart = await this.loadCart();
        cart = cart.filter(i => i.productId !== productId);
        await this.saveCart(cart);
        await this.updateCartBadge();
        return cart;
    },

    // Clear cart
    async clearCart() {
        await this.saveCart([]);
        await this.updateCartBadge();
    },

    // Load promo code
    loadPromo() {
        try {
            return JSON.parse(localStorage.getItem(this.PROMO_KEY)) || { code: '', discountRate: 0 };
        } catch (error) {
            return { code: '', discountRate: 0 };
        }
    },

    // Save promo code
    savePromo(promoState) {
        try {
            localStorage.setItem(this.PROMO_KEY, JSON.stringify(promoState));
        } catch (error) {
            console.error('Error saving promo:', error);
        }
    },

    // Apply promo code
    applyPromo(code) {
        const upperCode = (code || '').trim().toUpperCase();
        if (upperCode === 'ROOTED15') {
            this.savePromo({ code: upperCode, discountRate: 0.15 });
            return { success: true, message: 'Promo code applied: 15% off' };
        } else if (upperCode === '') {
            this.savePromo({ code: '', discountRate: 0 });
            return { success: true, message: 'Promo code cleared' };
        } else {
            return { success: false, message: 'Invalid promo code' };
        }
    },

    // Calculate shipping
    computeShipping(subtotal, region = 'sa') {
        if (region === 'intl') return 300;
        return subtotal >= 1000 ? 0 : 60;
    },

    // Calculate cart totals
    calculateTotals(cart, products, promo, region = 'sa') {
        let subtotal = 0;
        cart.forEach(line => {
            const product = products.find(p => p.id === line.productId);
            if (product) {
                subtotal += product.price * (line.quantity || 1);
            }
        });

        const discount = promo.discountRate ? subtotal * promo.discountRate : 0;
        const shipping = this.computeShipping(subtotal - discount, region);
        const total = Math.max(0, subtotal - discount) + shipping;

        return {
            subtotal,
            discount,
            shipping,
            total
        };
    }
};

// Export for use in other modules
window.CartModule = CartModule;