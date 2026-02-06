const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { sequelize } = require('../database');
const Product = require('../database/models/Product');

async function importSuppliers() {
    try {
        // 1. Connect to Database
        await sequelize.authenticate();
        console.log('Database connected.');

        // 2. Add column manually to avoid syncing other tables (which triggers policy errors)
        try {
            await sequelize.query('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplier_url" TEXT;');
            console.log('Ensure supplier_url column exists.');
        } catch (err) {
            console.warn('Could not add column (might already exist or permission issue):', err.message);
        }

        // 3. Read CSV
        const csvPath = path.join(__dirname, '../Supplier.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf8');

        const records = parse(fileContent, {
            columns: false,
            skip_empty_lines: true,
            from_line: 3
        });

        console.log(`Found ${records.length} records to process.`);

        // 4. Update Products
        let updatedCount = 0;
        let notFoundCount = 0;

        for (const record of records) {
            const productName = record[1]?.trim();
            const supplierUrl = record[2]?.trim();

            if (!productName || !supplierUrl) {
                console.log('Skipping invalid row:', record);
                continue;
            }

            // Try to find product by exact name first
            let product = await Product.findOne({ where: { name: productName } });

            if (!product) {
                console.warn(`Product not found: "${productName}"`);
                notFoundCount++;
                continue;
            }

            // Update product
            product.supplier_url = supplierUrl;
            await product.save();
            console.log(`Updated "${productName}" with supplier link.`);
            updatedCount++;
        }

        console.log('-----------------------------------');
        console.log(`Import Complete.`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Not Found: ${notFoundCount}`);

    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await sequelize.close();
    }
}

importSuppliers();
