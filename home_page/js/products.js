// Products Module - Handles product data management and storage
const ProductsModule = {
    STORAGE_KEY: 'beha_products_v2',

    // Default product data (fallback)
    defaultProducts: [
        {
            id: 1,
            name: "Deep V Backless Body Shaper Bra",
            price: 359.00,
            rating: 4.8,
            category: "shapewear",
            isTrailFavorite: true,
            image: "/images/product_1_Deep_V_Backless_Body_Shaper_Bra/1.png",
            hoverImage: "/images/product_1_Deep_V_Backless_Body_Shaper_Bra/2.png"
        },
        {
            id: 2,
            name: "Sculpt & Contour Body Shaper",
            price: 459.00,
            rating: 5.0,
            category: "shapewear",
            isTrailFavorite: true,
            image: "/images/product_2_Sculpt_&_Contour_Body_Shaper/1.png",
            hoverImage: "/images/product_2_Sculpt_&_Contour_Body_Shaper/2.png"
        },
        {
            id: 3,
            name: "The Sculpt & Smooth Minimizer",
            price: 520.00,
            rating: 4.9,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_3_The_Sculpt_&_Smooth_Minimizer/1.png",
            hoverImage: "/images/product_3_The_Sculpt_&_Smooth_Minimizer/2.png"
        },
        {
            id: 4,
            name: "Primary Choice",
            price: 899.00,
            rating: 4.7,
            category: "shapewear",
            isTrailFavorite: true,
            image: "/images/product_4_Primary_Choice/1.png",
            hoverImage: "/images/product_4_Primary_Choice/2.png"
        },
        {
            id: 5,
            name: "Aura Front-Closure Lace Bra",
            price: 450.00,
            rating: 4.6,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_5_Aura_Front-Closure_Lace_Bra/1.png",
            hoverImage: "/images/product_5_Aura_Front-Closure_Lace_Bra/2.png"
        },
        {
            id: 6,
            name: "The Zenith High-Impact Front-Zip Sports Bra",
            price: 399.00,
            rating: 4.5,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_6_The_Zenith_High-Impact_Front-Zip_Sports_Bra/1.png",
            hoverImage: "/images/product_6_The_Zenith_High-Impact_Front-Zip_Sports_Bra/2.png"
        },
        {
            id: 7,
            name: "The Seamless Silhouette Full-Coverage Bra",
            price: 350.00,
            rating: 4.9,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_7_The_Seamless_Silhouette_Full-Coverage_Bra/1.png",
            hoverImage: "/images/product_7_The_Seamless_Silhouette_Full-Coverage_Bra/2.png"
        },
        {
            id: 8,
            name: "The Sculpt-Soft Jelly Lift Bra",
            price: 299.00,
            rating: 5.0,
            category: "bras",
            isTrailFavorite: true,
            image: "/images/product_8_The_Sculpt-Soft_Jelly_Lift_Bra/1.png",
            hoverImage: "/images/product_8_The_Sculpt-Soft_Jelly_Lift_Bra/2.png"
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