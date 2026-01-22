// Search Module - Handles product search functionality
const SearchModule = {
    init() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    },

    openSearch() {
        window.ModalModule.openModal('searchModal');
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) resultsContainer.innerHTML = '';
    },

    performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const products = window.products || [];
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align:center; padding:1rem; color:#666;">No products found</p>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(product => `
            <div class="search-result-item" onclick="UIModule.openProductPage(${product.id}, '${product.name}', ${product.price})" style="display:flex; align-items:center; padding:0.5rem; cursor:pointer; border-bottom:1px solid #eee;">
                <img src="${product.image}" alt="${product.name}" style="width:50px; height:50px; object-fit:cover; margin-right:1rem; border-radius:4px;">
                <div>
                    <div style="font-weight:500;">${product.name}</div>
                    <div style="font-size:0.9rem; color:#666;">R ${product.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }
};

// Export for use in other modules
window.SearchModule = SearchModule;

// Global alias for HTML onclick attributes
window.openSearch = () => SearchModule.openSearch();
