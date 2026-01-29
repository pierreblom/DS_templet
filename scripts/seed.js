require('dotenv').config();
const { sequelize, Product, User } = require('../database/index');

const products = [
    // Bras
    {
        name: 'The Snap & Go Bra',
        price: 359.0,
        category: 'bras',
        image_url: '/images/snap-go-bra.jpg',
        description:
            'Front-closure bra with magnetic snaps for easy on/off. Perfect for everyday comfort.',
        stock: 50
    },
    {
        name: 'The Ultimate Coverage Bra',
        price: 459.0,
        category: 'bras',
        image_url: '/images/ultimate-coverage-bra.jpg',
        description: 'Full coverage wireless bra with wide straps for maximum support and comfort.',
        stock: 45
    },
    {
        name: 'The Glimmer Bra',
        price: 450.0,
        category: 'bras',
        image_url: '/images/glimmer-bra.jpg',
        description: 'Elegant lace-detailed bra that combines style with everyday wearability.',
        stock: 35
    },
    {
        name: 'The Active Zip Bra',
        price: 399.0,
        category: 'bras',
        image_url: '/images/active-zip-bra.jpg',
        description: 'High-impact sports bra with front zip for easy wear during workouts.',
        stock: 60
    },
    {
        name: 'The 24/7 Seamless Bra',
        price: 350.0,
        category: 'bras',
        image_url: '/images/seamless-bra.jpg',
        description: 'Ultra-soft seamless bra perfect for all-day comfort.',
        stock: 75
    },
    {
        name: 'The Seamless Soft Bra',
        price: 299.0,
        category: 'bras',
        image_url: '/images/soft-bra.jpg',
        description: 'Light support seamless bra for lounging and light activities.',
        stock: 55
    },
    // Shapewear
    {
        name: 'The Posture Perfect Shaper',
        price: 520.0,
        category: 'shapewear',
        image_url: '/images/posture-shaper.jpg',
        description: 'Back-support shaper that improves posture while smoothing your silhouette.',
        stock: 30
    },
    {
        name: 'The High Compression Bodysuit',
        price: 899.0,
        category: 'shapewear',
        image_url: '/images/bodysuit.jpg',
        description: 'Full-body shaper with firm compression for special occasions.',
        stock: 25
    },
    {
        name: 'High-Waist Smoothing Shorts',
        price: 380.0,
        category: 'shapewear',
        image_url: '/images/smoothing-shorts.jpg',
        description: 'High-waist shapewear shorts that smooth thighs and tummy.',
        stock: 40
    },
    {
        name: 'Seamless Shaping Brief',
        price: 250.0,
        category: 'shapewear',
        image_url: '/images/shaping-brief.jpg',
        description: 'Invisible under clothes with medium tummy control.',
        stock: 65
    },
    // Underwear
    {
        name: 'Cotton Comfort Bikini 3-Pack',
        price: 199.0,
        category: 'underwear',
        image_url: '/images/bikini-pack.jpg',
        description: 'Breathable cotton bikini underwear in neutral colors.',
        stock: 80
    },
    {
        name: 'Seamless Thong 5-Pack',
        price: 249.0,
        category: 'underwear',
        image_url: '/images/thong-pack.jpg',
        description: 'No-show seamless thongs perfect under any outfit.',
        stock: 70
    }
];

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully.');

        console.log('Syncing database schema...');
        await sequelize.sync({ force: true }); // Reset database

        console.log('Creating admin user...');
        const adminUser = await User.create({
            email: 'admin@shopbeha.com',
            password: 'Admin123!',
            name: 'Admin User',
            role: 'admin'
        });
        console.log(`Admin user created: ${adminUser.email}`);

        console.log('Creating sample customer...');
        const customerUser = await User.create({
            email: 'customer@example.com',
            password: 'Customer123!',
            name: 'Sample Customer',
            role: 'customer'
        });
        console.log(`Customer user created: ${customerUser.email}`);

        console.log('Creating products...');
        for (const product of products) {
            await Product.create(product);
        }
        console.log(`${products.length} products created.`);

        console.log('\n=== Database seeded successfully! ===');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@shopbeha.com');
        console.log('Password: Admin123!');
        console.log('\nCustomer credentials:');
        console.log('Email: customer@example.com');
        console.log('Password: Customer123!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
