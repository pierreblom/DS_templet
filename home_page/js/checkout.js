document.addEventListener('DOMContentLoaded', async () => {
    const checkoutItemsList = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    const discountEl = document.getElementById('summary-discount');
    const discountRow = document.getElementById('summary-discount-row');
    const checkoutForm = document.getElementById('checkoutForm');
    const payButton = document.getElementById('pay-button');
    const yocoLoader = document.getElementById('yoco-loader');
    const btnText = document.getElementById('btn-text');

    // Load products once for the entire script
    const allProducts = typeof ProductsModule !== 'undefined' ? await ProductsModule.loadProducts() : (window.products || []);

    // 1. Initial Render & Prefill
    async function renderSummary() {
        const cart = await CartModule.loadCart();
        const allProducts = typeof ProductsModule !== 'undefined' ? await ProductsModule.loadProducts() : (window.products || []);

        if (cart.length === 0) {
            window.location.href = '/';
            return;
        }

        // --- Prefill logic ---
        // --- Prefill logic using AuthManager ---
        if (window.AuthManager && AuthManager.isLoggedIn()) {
            try {
                const response = await AuthManager.fetchWithAuth('/api/v1/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    const profile = data.user;
                    if (profile) {
                        if (document.getElementById('email')) document.getElementById('email').value = profile.email || '';
                        if (document.getElementById('firstName')) document.getElementById('firstName').value = profile.first_name || '';
                        if (document.getElementById('lastName')) document.getElementById('lastName').value = profile.last_name || '';
                        if (document.getElementById('phone')) document.getElementById('phone').value = profile.phone || '';
                        if (document.getElementById('address')) document.getElementById('address').value = profile.address || '';
                        if (document.getElementById('city')) document.getElementById('city').value = profile.city || '';
                        if (document.getElementById('postalCode')) document.getElementById('postalCode').value = profile.postal_code || '';
                        console.log('Profile prefilled!');
                    }
                }
            } catch (err) {
                console.warn('Could not prefill profile:', err);
            }
        }
        // -----------------------

        checkoutItemsList.innerHTML = '';

        // Use loaded products
        cart.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId);
            if (!product) return;

            const row = document.createElement('div');
            row.className = 'checkout-item';
            row.innerHTML = `
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="checkout-item-info">
                    <h4>${product.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <div style="font-weight: 600; font-size: 0.9rem;">R ${(product.price * item.quantity).toFixed(2)}</div>
                </div>
            `;
            checkoutItemsList.appendChild(row);
        });

        const promo = CartModule.loadPromo();
        const region = document.getElementById('country').value === 'ZA' ? 'sa' : 'intl';
        const totals = CartModule.calculateTotals(cart, allProducts, promo, region);

        subtotalEl.textContent = `R ${totals.subtotal.toFixed(2)}`;
        shippingEl.textContent = `R ${totals.shipping.toFixed(2)}`;
        totalEl.textContent = `R ${totals.total.toFixed(2)}`;

        if (totals.discount > 0) {
            discountRow.style.display = 'flex';
            discountEl.textContent = `- R ${totals.discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }

        return totals;
    }

    const totals = await renderSummary();

    // 2. Handle Form Submission & Yoco Redirect
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Remove blocking auth check
        let accessToken = null;
        if (window.AuthManager && AuthManager.isLoggedIn()) {
            accessToken = AuthManager.getAccessToken();
        }

        // Show loading state
        payButton.disabled = true;
        yocoLoader.style.display = 'block';
        btnText.textContent = 'Processing...';

        try {
            const cart = await CartModule.loadCart();
            const promo = CartModule.loadPromo();
            const region = document.getElementById('country').value === 'ZA' ? 'sa' : 'intl';
            const finalTotals = CartModule.calculateTotals(cart, allProducts, promo, region);

            if (isNaN(finalTotals.total) || finalTotals.total <= 0) {
                throw new Error('Invalid order total. Please check your cart.');
            }
            if (finalTotals.total < 2) {
                throw new Error('Minimum order amount is R 2.00');
            }
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const postalCode = document.getElementById('postalCode').value;
            const country = document.getElementById('country').value;

            // Prepare shipping address object
            const shippingAddress = {
                firstName,
                lastName,
                address1: address,
                city,
                postalCode,
                country,
                phone,
                email
            };

            // Call Backend API to create order
            // This handles both authenticated users (via token) and guests (no token)
            console.log('Creating order via API...');

            const headers = {
                'Content-Type': 'application/json'
            };
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const createOrderResponse = await fetch('/api/v1/orders', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    items: cart, // Cart items structure needs to match validator expectations? 
                    // Cart items: { productId, quantity, options }
                    // Validator: { productId, quantity }
                    shippingAddress,
                    promoCode: promo.code || null
                })
            });

            if (!createOrderResponse.ok) {
                const errorData = await createOrderResponse.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            const { order } = await createOrderResponse.json();
            const orderId = order.id;
            console.log('Order created successfully:', orderId);

            // Call backend to create Yoco checkout session
            // Send cart items so server can recalculate prices
            const response = await fetch('/api/v1/yoco/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart, // Send cart items for server-side price validation
                    promoCode: promo.code || null, // Send promo code for server-side validation
                    region: region, // Send region for shipping calculation
                    successUrl: `${window.location.origin}/orders.html?status=success&orderId=${orderId}`,
                    cancelUrl: `${window.location.href}?status=cancelled`,
                    metadata: {
                        orderId: orderId,
                        customerEmail: email,
                        customerName: `${firstName} ${lastName}`
                    }
                }),
            });

            const data = await response.json();

            if (data.success && data.checkoutUrl) {
                // Optional: Verify server-calculated total matches client-side
                if (data.calculatedTotal) {
                    const serverTotal = data.calculatedTotal.total;
                    const clientTotal = finalTotals.total;
                    const diff = Math.abs(serverTotal - clientTotal);

                    // Allow small rounding differences (< 1 cent)
                    if (diff > 0.01) {
                        console.warn('Price mismatch detected:', {
                            client: clientTotal,
                            server: serverTotal,
                            difference: diff
                        });
                        // Still proceed but log the discrepancy
                    }
                }

                window.location.href = data.checkoutUrl;
            } else {
                const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                throw new Error(errorMsg || 'Failed to initiate Yoco checkout');
            }

        } catch (error) {
            console.error('Checkout error detail:', error);
            const displayMsg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
            window.showNotification('Checkout failed: ' + displayMsg, 'error');

            // Reset button
            payButton.disabled = false;
            yocoLoader.style.display = 'none';
            btnText.textContent = 'Pay Now';
        }
    });

    // Update totals when country changes
    document.getElementById('country').addEventListener('change', renderSummary);
});
