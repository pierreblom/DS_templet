// Products Module - Handles product data management and storage
const ProductsModule = {
    STORAGE_KEY: 'beha_products_v1',

    // Default product data (fallback)
    defaultProducts: [
        {
            id: 1,
            name: "The Snap & Go Bra",
            price: 359.00,
            rating: 4.8,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_1_The_Snap_&_Go_Bra/1.png",
            hoverImage: "/images/product_1_The_Snap_&_Go_Bra/2.png"
        },
        {
            id: 2,
            name: "The Ultimate Coverage Bra",
            price: 459.00,
            rating: 5.0,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_2_The_Ultimate_Coverage_Bra/1.png",
            hoverImage: "/images/product_2_The_Ultimate_Coverage_Bra/2.png"
        },
        {
            id: 3,
            name: "The Posture Perfect Shaper",
            price: 520.00,
            rating: 4.9,
            category: "shapewear",
            isTrailFavorite: true,
            image: "/images/product_3_The_Posture_Perfect_Shaper/1.png",
            hoverImage: "/images/product_3_The_Posture_Perfect_Shaper/2.png"
        },
        {
            id: 4,
            name: "The High Compression Bodysuit",
            price: 899.00,
            rating: 4.7,
            category: "shapewear",
            isTrailFavorite: true,
            image: "/images/product_4_The_High_Compression_Bodysuit/1.png",
            hoverImage: "/images/product_4_The_High_Compression_Bodysuit/2.png"
        },
        {
            id: 5,
            name: "The Glimmer Bra",
            price: 450.00,
            rating: 4.6,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_5_The_Glimmer_Bra/1.png",
            hoverImage: "/images/product_5_The_Glimmer_Bra/2.png"
        },
        {
            id: 6,
            name: "The Active Zip Bra",
            price: 399.00,
            rating: 4.5,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_6_The_Active_Zip_Bra/1.png",
            hoverImage: "/images/product_6_The_Active_Zip_Bra/2.png"
        },
        {
            id: 7,
            name: "The 24/7 Seamless Bra",
            price: 350.00,
            rating: 4.9,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_7_The_24.7 Seamless Bra/1.png",
            hoverImage: "/images/product_7_The_24.7 Seamless Bra/2.png"
        },
        {
            id: 8,
            name: "The Seamless Soft Bra",
            price: 299.00,
            rating: 5.0,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_8_The_Seamless_Soft_Bra/1.png",
            hoverImage: "/images/product_8_The_Seamless_Soft_Bra/2.png"
        }
    ],

    // Load products from storage or return defaults
    loadProducts() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return [...this.defaultProducts];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [...this.defaultProducts];
        } catch (error) {
            console.error('Error loading products:', error);
            return [...this.defaultProducts];
        }
    },

    // Save products to storage
    saveProducts(products) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
        } catch (error) {
            console.error('Error saving products:', error);
        }
    },

    // Get trail favorites
    getTrailFavorites(products) {
        return products.filter(product => product.isTrailFavorite);
    },

    // Add product to trail favorites
    addToTrailFavorites(products, productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.isTrailFavorite = true;
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Remove product from trail favorites
    removeFromTrailFavorites(products, productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.isTrailFavorite = false;
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Find product by ID
    findProduct(products, productId) {
        return products.find(p => p.id === productId);
    },

    // Generate star rating HTML
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }

        if (halfStar) {
            stars += '½';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return stars;
    },

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'bras': '👙',
            'bottoms': '🩲',
            'maternity': '🤰',
            'shapewear': '⏳'
        };
        return icons[category] || '🛍️';
    }
};

// Export for use in other modules
window.ProductsModule = ProductsModule;