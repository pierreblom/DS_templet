/**
 * Search Module
 * Handles search functionality and modal
 */

/**
 * Search Manager class
 */
class SearchManager {
    constructor(allProducts = []) {
        this.allProducts = allProducts;
        this.init();
    }

    /**
     * Initialize search functionality
     */
    init() {
        this.bindEvents();
    }

    /**
     * Update products data
     */
    setProducts(products) {
        this.allProducts = products;
    }

    /**
     * Bind search-related events
     */
    bindEvents() {
        // Search button clicks
        const searchButtons = document.querySelectorAll('[aria-label="Search"]');
        searchButtons.forEach(btn => {
            btn.addEventListener('click', () => this.openSearch());
        });
    }

    /**
     * Open search modal
     */
    openSearch() {
        if (modalManager.openModal('searchModal')) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                // Clear previous results
                const results = document.getElementById('searchResults');
                if (results) results.innerHTML = '';

                // Focus input after modal animation
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.value = '';
                }, 100);

                // Bind search input event
                searchInput.oninput = () => this.performSearch();
            }
        }
    }

    /**
     * Perform search operation
     */
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (!searchInput || !searchResults) return;

        const query = this.getSearchQuery(searchInput);

        if (query.length === 0) {
            this.clearSearchResults(searchResults);
            return;
        }

        const filteredProducts = this.filterProducts(query);
        this.renderSearchResults(searchResults, filteredProducts);
    }

    /**
     * Get and normalize search query
     */
    getSearchQuery(searchInput) {
        return searchInput.value.trim().toLowerCase();
    }

    /**
     * Clear search results
     */
    clearSearchResults(searchResults) {
        searchResults.innerHTML = '';
    }

    /**
     * Filter products based on query
     */
    filterProducts(query) {
        return this.allProducts.filter(product =>
            this.matchesQuery(product, query)
        );
    }

    /**
     * Check if product matches search query
     */
    matchesQuery(product, query) {
        return product.name.toLowerCase().includes(query) ||
               product.category.toLowerCase().includes(query);
    }

    /**
     * Render search results
     */
    renderSearchResults(searchResults, filteredProducts) {
        searchResults.innerHTML = '';

        if (filteredProducts.length === 0) {
            this.renderNoResults(searchResults);
            return;
        }

        filteredProducts.forEach(product => {
            const resultItem = this.createResultItem(product);
            searchResults.appendChild(resultItem);
        });
    }

    /**
     * Render no results message
     */
    renderNoResults(searchResults) {
        searchResults.innerHTML = '<div style="padding:1rem; text-align:center; color:#666;">No products found.</div>';
    }

    /**
     * Create search result item element
     */
    createResultItem(product) {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = () => this.handleResultClick(product);
        resultItem.innerHTML = this.getResultItemHTML(product);
        return resultItem;
    }

    /**
     * Handle search result click
     */
    handleResultClick(product) {
        modalManager.closeModal('searchModal');
        window.location.href = `select.html?id=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
    }

    /**
     * Get HTML for search result item
     */
    getResultItemHTML(product) {
        return `
            <div style="font-size:1.5rem;">${this.getCategoryIcon(product.category)}</div>
            <div>
                <div style="font-weight:600;">${product.name}</div>
                <div style="color:#888;">R ${product.price.toFixed(2)}</div>
            </div>
        `;
    }

    /**
     * Get category icon for search results
     */
    getCategoryIcon(category) {
        switch (category) {
            case 'bras': return '👙';
            case 'bottoms': return '🩲';
            case 'maternity': return '🤰';
            case 'shapewear': return '⏳';
            default: return '🛍️';
        }
    }
}

// Create search manager instance
const searchManager = new SearchManager();

// Make globally available
window.searchManager = searchManager;

// Legacy functions for backward compatibility
function openSearch() {
    searchManager.openSearch();
}

function performSearch() {
    searchManager.performSearch();
}

function getCategoryIcon(category) {
    return searchManager.getCategoryIcon(category);
}