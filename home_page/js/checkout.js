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
    const allProducts = typeof ProductsModule !== 'undefined' ? ProductsModule.loadProducts() : (window.products || []);

    // 1. Initial Render & Prefill
    async function renderSummary() {
        const cart = await CartModule.loadCart();
        const allProducts = typeof ProductsModule !== 'undefined' ? ProductsModule.loadProducts() : (window.products || []);

        if (cart.length === 0) {
            window.location.href = '/';
            return;
        }

        // --- Prefill logic ---
        if (typeof window.supabaseClient !== 'undefined') {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session?.user) {
                console.log('Fetching user profile for prefill...');
                const { data: profile } = await window.supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    if (document.getElementById('email')) document.getElementById('email').value = session.user.email || '';
                    if (document.getElementById('firstName')) document.getElementById('firstName').value = profile.first_name || '';
                    if (document.getElementById('lastName')) document.getElementById('lastName').value = profile.last_name || '';
                    if (document.getElementById('phone')) document.getElementById('phone').value = profile.phone || '';
                    if (document.getElementById('address')) document.getElementById('address').value = profile.address || '';
                    if (document.getElementById('city')) document.getElementById('city').value = profile.city || '';
                    if (document.getElementById('postalCode')) document.getElementById('postalCode').value = profile.postal_code || '';
                    console.log('Profile prefilled!');
                } else {
                    // Just prefill email from auth if no profile entry exists yet
                    if (document.getElementById('email')) document.getElementById('email').value = session.user.email || '';
                }
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
                <img src="${product.image}" alt="${product.name}">
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

        // Check if user is logged in
        if (typeof window.supabaseClient !== 'undefined') {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
                alert("Please sign in to complete your purchase.");
                if (typeof window.openLoginModal === 'function') {
                    window.openLoginModal('signin');
                }
                return;
            }
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

            // Create order in Supabase first (optional but recommended)
            let orderId = 'local_' + Date.now();

            if (typeof window.supabaseClient !== 'undefined') {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (session?.user) {
                    console.log('Creating order in Supabase...');

                    // --- Update/Create Profile during checkout ---
                    const { error: profileError } = await window.supabaseClient
                        .from('profiles')
                        .upsert({
                            id: session.user.id,
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone,
                            address: address,
                            city: city,
                            postal_code: postalCode,
                            email: email,
                            updated_at: new Date()
                        });

                    if (profileError) {
                        console.warn('Profile sync failed (non-critical):', profileError);
                        // We don't throw here as the order is more important, 
                        // but you might want to know why it failed.
                    }
                    // ----------------------------------------------

                    const { data: order, error } = await window.supabaseClient
                        .from('orders')
                        .insert({
                            user_id: session.user.id,
                            email: email,
                            total_amount: finalTotals.total,
                            status: 'pending',
                            shipping_address: {
                                address: address,
                                city: city,
                                postalCode: postalCode,
                                country: country,
                                firstName: firstName,
                                lastName: lastName,
                                phone: phone
                            },
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('Supabase Order Error:', error);
                        throw new Error(error.message || 'Error creating order in database');
                    }
                    orderId = order.id;
                    console.log('Order created successfully:', orderId);

                    // Insert Order Items
                    const orderItems = cart.map(item => {
                        const product = allProducts.find(p => p.id === item.productId);
                        return {
                            order_id: orderId,
                            product_id: item.productId,
                            product_name: product ? product.name : 'Unknown Product',
                            quantity: item.quantity,
                            price: product ? product.price : 0,
                            size: item.options?.size || null,
                            color: item.options?.color || null
                        };
                    });

                    const { error: itemsError } = await window.supabaseClient
                        .from('order_items')
                        .insert(orderItems);

                    if (itemsError) {
                        console.error('Error inserting order items:', itemsError);
                        // Non-critical for the payment redirect, but good to know
                    }
                }
            }

            // Call backend to create Yoco checkout session
            const response = await fetch('/api/v1/yoco/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(finalTotals.total * 100), // Yoco expects cents
                    currency: 'ZAR',
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
                window.location.href = data.checkoutUrl;
            } else {
                const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                throw new Error(errorMsg || 'Failed to initiate Yoco checkout');
            }

        } catch (error) {
            console.error('Checkout error detail:', error);
            const displayMsg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
            alert('Checkout failed: ' + displayMsg);

            // Reset button
            payButton.disabled = false;
            yocoLoader.style.display = 'none';
            btnText.textContent = 'Pay Now';
        }
    });

    // Update totals when country changes
    document.getElementById('country').addEventListener('change', renderSummary);
});
