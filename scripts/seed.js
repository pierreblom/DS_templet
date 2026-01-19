const { sequelize, Product } = require('../database/index');

const products = [
    // Leggings
    {
        name: "High-Waist Performance Leggings",
        price: 89.00,
        category: "leggings",
        image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
        description: "High-performance leggings designed for movement and comfort"
    },
    {
        name: "Compression Yoga Leggings",
        price: 95.00,
        category: "leggings",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "High-performance leggings designed for movement and comfort"
    },
    {
        name: "Seamless Workout Leggings",
        price: 78.00,
        category: "leggings",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "High-performance leggings designed for movement and comfort"
    },
    {
        name: "Athletic Capri Leggings",
        price: 65.00,
        category: "leggings",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "High-performance leggings designed for movement and comfort"
    },
    // Bras
    {
        name: "High-Impact Sports Bra",
        price: 45.00,
        category: "bras",
        image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
        description: "Supportive and comfortable sports bras for every activity"
    },
    {
        name: "Wireless Comfort Bra",
        price: 38.00,
        category: "bras",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Supportive and comfortable sports bras for every activity"
    },
    {
        name: "Seamless Yoga Bra",
        price: 42.00,
        category: "bras",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Supportive and comfortable sports bras for every activity"
    },
    {
        name: "Longline Support Bra",
        price: 48.00,
        category: "bras",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Supportive and comfortable sports bras for every activity"
    },
    // Tops
    {
        name: "Moisture-Wicking Tank Top",
        price: 35.00,
        category: "tops",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Versatile tops and tanks for every workout and lifestyle"
    },
    {
        name: "Cropped Athletic Tee",
        price: 28.00,
        category: "tops",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Versatile tops and tanks for every workout and lifestyle"
    },
    {
        name: "Long Sleeve Workout Top",
        price: 42.00,
        category: "tops",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Versatile tops and tanks for every workout and lifestyle"
    },
    {
        name: "Racerback Performance Tank",
        price: 32.00,
        category: "tops",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Versatile tops and tanks for every workout and lifestyle"
    },
    // Outerwear
    {
        name: "Lightweight Hoodie",
        price: 65.00,
        category: "outerwear",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Comfortable outerwear for layering and style"
    },
    {
        name: "Zip-Up Athletic Jacket",
        price: 78.00,
        category: "outerwear",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Comfortable outerwear for layering and style"
    },
    {
        name: "Oversized Sweatshirt",
        price: 55.00,
        category: "outerwear",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Comfortable outerwear for layering and style"
    },
    {
        name: "Windbreaker Jacket",
        price: 85.00,
        category: "outerwear",
        image_url: "https://images.unsplash.com/photo-1506629905607-3b3b0b0b0b0b?w=400&h=400&fit=crop&crop=center",
        description: "Comfortable outerwear for layering and style"
    }
];

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Reset database

        for (const product of products) {
            await Product.create(product);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
