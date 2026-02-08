require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const sequelize = require('../database/database');
const Product = require('../database/models/Product');
const ProductImage = require('../database/models/ProductImage');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const BUCKET_NAME = 'product-images';
const IMAGES_DIR = path.join(__dirname, '../images');

// Product mapping based on folder names
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

async function ensureBucketExists() {
    console.log('Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        throw listError;
    }

    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
        throw new Error(`Bucket ${BUCKET_NAME} does not exist. Please create it manually in Supabase dashboard.`);
    }

    console.log('Bucket exists ✓');
}

async function uploadImage(filePath, storagePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = 'image/png';

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error(`Error uploading ${storagePath}:`, error);
        return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    return publicUrl;
}

async function uploadProductImages() {
    console.log('Starting image upload process...\n');

    // await ensureBucketExists(); // Bucket already exists, anon key can't list buckets
    await sequelize.authenticate();

    const productFolders = Object.keys(productMapping);

    for (const folderName of productFolders) {
        const productName = productMapping[folderName];
        console.log(`\n📦 Processing: ${productName}`);

        // Find product in database
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

        // Clear existing images for this product
        await ProductImage.destroy({ where: { product_id: product.id } });

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const storagePath = `${folderName}/${file}`;

            console.log(`   Uploading: ${file}...`);
            const publicUrl = await uploadImage(filePath, storagePath);

            if (publicUrl) {
                // Determine image type and metadata
                let imageType = 'gallery';
                let displayOrder = 0;
                let colorName = null;

                if (file === '1.png') {
                    imageType = 'main';
                    displayOrder = 1;
                    mainImageUrl = publicUrl;
                } else if (file === '2.png') {
                    imageType = 'hover';
                    displayOrder = 2;
                    hoverImageUrl = publicUrl;
                } else if (file === '3.png') {
                    imageType = 'gallery';
                    displayOrder = 3;
                } else if (file === '4.png') {
                    imageType = 'gallery';
                    displayOrder = 4;
                } else {
                    // Color variant images
                    imageType = 'color_variant';
                    colorName = file.replace('.png', '').replace('.jpg', '').replace('.jpeg', '');
                    displayOrder = 100; // Color variants come after gallery images
                }

                // Save to product_images table
                await ProductImage.create({
                    product_id: product.id,
                    image_url: publicUrl,
                    image_type: imageType,
                    display_order: displayOrder,
                    color_name: colorName,
                    alt_text: `${productName} - ${colorName || imageType}`
                });

                imageUrls.push({
                    url: publicUrl,
                    type: imageType,
                    color: colorName,
                    order: displayOrder
                });

                console.log(`   ✓ Uploaded: ${file} (${imageType}${colorName ? ' - ' + colorName : ''})`);
            }
        }

        // Update product with main and hover images, and all images in JSONB field
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
        console.log(`   Main: ${mainImageUrl ? '✓' : '✗'} | Hover: ${hoverImageUrl ? '✓' : '✗'}`);
    }

    console.log('\n✅ Image upload complete!');
}

// Run the script
uploadProductImages()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
