// UI Module - Handles UI rendering and updates
const UIModule = {
    // Render trail favorites section
    renderTrailFavorites(products) {
        const container = document.getElementById('trail-favorites-container');
        if (!container) return;

        container.innerHTML = '';
        const trailFavorites = window.ProductsModule.getTrailFavorites(products);

        trailFavorites.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const stars = window.ProductsModule.generateStarRating(product.rating);

            productCard.innerHTML = `
                <div class="product-image" onclick="UIModule.openProductPage(${product.id}, '${product.name}', ${product.price})">
                    <img src="${product.image}" alt="${product.name}" class="main-img">
                    ${product.hoverImage ? `<img src="${product.hoverImage}" alt="${product.name} hover" class="hover-img">` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="rating" aria-label="Rated ${product.rating} out of 5">${stars} (${product.rating}/5)</div>
                    <div class="price">R ${product.price.toFixed(2)}</div>
                    <button class="add-button" aria-label="Quick add ${product.name} to cart" onclick="UIModule.quickAddToCart(${product.id})">ADD TO CART</button>
                </div>
            `;

            container.appendChild(productCard);
        });
    },

    // Render cart
    async renderCart() {
        const container = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const shippingEl = document.getElementById('shippingAmount');
        const shippingLineEl = document.getElementById('cartShipping');
        const subtotalEl = document.getElementById('cartSubtotal');
        const discountEl = document.getElementById('cartDiscount');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const promoInput = document.getElementById('promoCode');

        if (!container || !totalEl) return;

        const cart = await window.CartModule.loadCart();
        const products = window.products || [];
        const promo = window.CartModule.loadPromo();

        container.innerHTML = '';
        let subtotal = 0;

        cart.forEach(line => {
            const product = window.ProductsModule.findProduct(products, line.productId);
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
                        <button class="remove-btn" onclick="UIModule.removeFromCart(${product.id})" aria-label="Remove ${product.name}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-item-meta">Size: M | Color: Nude</div>
                    <div class="cart-item-bottom">
                        <div class="cart-qty-controls">
                            <button class="qty-btn" onclick="UIModule.decreaseQuantity(${product.id})">-</button>
                            <span>${line.quantity || 1}</span>
                            <button class="qty-btn" onclick="UIModule.increaseQuantity(${product.id})">+</button>
                        </div>
                        <div class="cart-item-price">R ${lineTotal.toFixed(2)}</div>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });

        if (promoInput) promoInput.value = promo.code || '';

        const totals = window.CartModule.calculateTotals(cart, products, promo);
        const { discount, shipping, total } = totals;

        if (shippingEl) shippingEl.textContent = `Shipping: R ${shipping.toFixed(2)}`;
        if (shippingLineEl) shippingLineEl.textContent = `R ${shipping.toFixed(2)}`;
        if (subtotalEl) subtotalEl.textContent = `R ${subtotal.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `- R ${discount.toFixed(2)}`;
        totalEl.textContent = `R ${total.toFixed(2)}`;

        if (checkoutBtn) {
            const isEmpty = subtotal <= 0;
            checkoutBtn.disabled = isEmpty;
            checkoutBtn.style.opacity = isEmpty ? '0.6' : '1';
            checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
        }
    },

    // Populate product lists for admin modal
    populateProductLists(products) {
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
                    `<button class="delete-btn" onclick="UIModule.removeFromTrailFavorites(${product.id})">Remove</button>` :
                    `<button class="edit-btn" onclick="UIModule.addToTrailFavorites(${product.id})">Add</button>`
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

    // Navigation helpers
    openProductPage(productId, productName, productPrice) {
        const encodedName = encodeURIComponent(productName);
        const url = `../Select/select.html?id=${productId}&name=${encodedName}&price=${productPrice}`;
        window.location.href = url;
    },

    // Category page removed - function disabled
    // openCategoryPage(category) {
    //     const url = `../category_page.html?category=${category}`;
    //     window.location.href = url;
    // },

    openCart() {
        window.ModalModule.openModal('cartModal');
        this.renderCart();
    },

    openCheckout() {
        window.location.href = '/checkout.html';
    },

    // Cart operations with UI updates
    async quickAddToCart(productId) {
        await window.CartModule.addToCart(productId);
        this.openCart(); // Open cart to show feedback
    },

    async increaseQuantity(productId) {
        const cart = await window.CartModule.loadCart();
        const line = cart.find(l => l.productId === productId);
        if (line) {
            await window.CartModule.updateQuantity(productId, (line.quantity || 1) + 1);
            this.renderCart();
        }
    },

    async decreaseQuantity(productId) {
        const cart = await window.CartModule.loadCart();
        const line = cart.find(l => l.productId === productId);
        if (line) {
            await window.CartModule.updateQuantity(productId, Math.max(1, (line.quantity || 1) - 1));
            this.renderCart();
        }
    },

    async removeFromCart(productId) {
        await window.CartModule.removeFromCart(productId);
        this.renderCart();
    },

    // Trail favorites operations
    addToTrailFavorites(productId) {
        if (window.products && window.ProductsModule.addToTrailFavorites(window.products, productId)) {
            this.populateProductLists(window.products);
            this.renderTrailFavorites(window.products);
        }
    },

    removeFromTrailFavorites(productId) {
        if (window.products && window.ProductsModule.removeFromTrailFavorites(window.products, productId)) {
            this.populateProductLists(window.products);
            this.renderTrailFavorites(window.products);
        }
    },

    // Promo operations
    applyPromo() {
        const input = document.getElementById('promoCode');
        if (!input) return;

        const result = window.CartModule.applyPromo(input.value);
        alert(result.message);
        this.renderCart();
    },

    // Form handling
    handleImageUpload(input) {
        const uploadedImagesContainer = document.getElementById('uploadedImages');
        if (!uploadedImagesContainer) return;

        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'uploaded-image';
                imageDiv.innerHTML = `<img src="${e.target.result}" style="width:100px; height:100px; object-fit:cover;">`;
                uploadedImagesContainer.appendChild(imageDiv);
            };
            reader.readAsDataURL(file);
        });
    }
};

// Export for use in other modules
window.UIModule = UIModule;