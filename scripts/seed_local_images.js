require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../database/database');
const Product = require('../database/models/Product');
const ProductImage = require('../database/models/ProductImage');

const IMAGES_DIR = path.join(__dirname, '../images');

// Product data extracted from frontend JS
const defaultProducts = [
    {
        name: "Deep V Backless Body Shaper Bra",
        price: 359.00,
        rating: 4.8,
        category: "shapewear",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "Sculpt & Contour Body Shaper",
        price: 459.00,
        rating: 5.0,
        category: "shapewear",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "The Sculpt & Smooth Minimizer",
        price: 520.00,
        rating: 4.9,
        category: "bras",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "Primary Choice",
        price: 899.00,
        rating: 4.7,
        category: "shapewear",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "Aura Front-Closure Lace Bra",
        price: 450.00,
        rating: 4.6,
        category: "bras",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "The Zenith High-Impact Front-Zip Sports Bra",
        price: 399.00,
        rating: 4.5,
        category: "bras",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "The Seamless Silhouette Full-Coverage Bra",
        price: 350.00,
        rating: 4.9,
        category: "bras",
        is_trail_favorite: true,
        stock_quantity: 100
    },
    {
        name: "The Sculpt-Soft Jelly Lift Bra",
        price: 299.00,
        rating: 5.0,
        category: "bras",
        is_trail_favorite: true,
        stock_quantity: 100
    }
];

const productMapping = {
    'product_1_Deep_V_Backless_Body_Shaper_Bra': 'Deep V Backless Body Shaper Bra',
    'product_2_Sculpt_&_Contour_Body_Shaper': 'Sculpt & Contour Body Shaper',
    'product_3_The_Sculpt_&_Smooth_Minimizer': 'The Sculpt & Smooth Minimizer',
    'product_4_Primary_Choice': 'Primary Choice',
    'product_5_Aura_Front-Closure_Lace_Bra': 'Aura Front-Closure Lace Bra',
    'product_6_The_Zenith_High-Impact_Front-Zip_Sports_Bra': 'The Zenith High-Impact Front-Zip Sports Bra',
    'product_7_The_Seamless_Silhouette_Full-Coverage_Bra': 'The Seamless Silhouette Full-Coverage Bra',
    'product_8_The_Sculpt-Soft_Jelly_Lift_Bra': 'The Sculpt-Soft Jelly Lift Bra'
};

async function seedLocalImages() {
    console.log('Starting local image seeding process...\n');

    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    // Seed products first
    for (const prodData of defaultProducts) {
        let product = await Product.findOne({ where: { name: prodData.name } });
        if (!product) {
            console.log(`Creating product: ${prodData.name}`);
            product = await Product.create(prodData);
        }
    }

    const productFolders = Object.keys(productMapping);

    for (const folderName of productFolders) {
        const productName = productMapping[folderName];
        console.log(`\n📦 Processing images for: ${productName}`);

        const product = await Product.findOne({ where: { name: productName } });

        if (!product) {
            console.log(`⚠️  Product not found in database: ${productName}`);
            continue;
        }

        const folderPath = path.join(IMAGES_DIR, folderName);

        if (!fs.existsSync(folderPath)) {
            console.log(`⚠️  Folder not found: ${folderPath}`);
            continue;
        }

        const files = fs.readdirSync(folderPath).filter(file =>
            file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
        );

        console.log(`   Found ${files.length} images`);

        const imageUrls = [];
        let mainImageUrl = null;
        let hoverImageUrl = null;

        await ProductImage.destroy({ where: { product_id: product.id } });

        for (const file of files) {
            const localUrl = `/images/${folderName}/${file}`;

            let imageType = 'gallery';
            let displayOrder = 0;
            let colorName = null;

            if (file === '1.png' || file === '1.jpg') {
                imageType = 'main';
                displayOrder = 1;
                mainImageUrl = localUrl;
            } else if (file === '2.png' || file === '2.jpg') {
                imageType = 'hover';
                displayOrder = 2;
                hoverImageUrl = localUrl;
            } else if (file === '3.png' || file === '3.jpg') {
                imageType = 'gallery';
                displayOrder = 3;
            } else if (file === '4.png' || file === '4.jpg') {
                imageType = 'gallery';
                displayOrder = 4;
            } else {
                imageType = 'color_variant';
                colorName = file.replace('.png', '').replace('.jpg', '').replace('.jpeg', '');
                displayOrder = 100;
            }

            await ProductImage.create({
                product_id: product.id,
                image_url: localUrl,
                image_type: imageType,
                display_order: displayOrder,
                color_name: colorName,
                alt_text: `${productName} - ${colorName || imageType}`
            });

            imageUrls.push({
                url: localUrl,
                type: imageType,
                color: colorName,
                order: displayOrder
            });

            console.log(`   ✓ Added: ${file} (${imageType}${colorName ? ' - ' + colorName : ''}) -> ${localUrl}`);
        }

        const updateData = {
            images: imageUrls.map(img => img.url)
        };

        if (mainImageUrl) {
            updateData.image_url = mainImageUrl;
        }
        if (hoverImageUrl) {
            updateData.hover_image_url = hoverImageUrl;
        }

        await product.update(updateData);
        console.log(`   ✓ Updated product with ${imageUrls.length} images`);
    }

    console.log('\n✅ Local image seeding complete!');
}

seedLocalImages()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
