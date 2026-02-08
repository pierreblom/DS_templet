-- Migration: Add product_images table for storing multiple images per product
-- Created: 2026-02-08
-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) DEFAULT 'gallery',
    -- 'main', 'hover', 'gallery', 'color_variant'
    display_order INTEGER DEFAULT 0,
    alt_text VARCHAR(255),
    color_name VARCHAR(50),
    -- For color variant images (e.g., 'black', 'beige', 'pink')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, image_url)
);
-- Create index for faster lookups
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_type ON product_images(image_type);
-- Add images JSONB column to products table (for backward compatibility and quick access)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
-- Add comment
COMMENT ON TABLE product_images IS 'Stores multiple images for each product including gallery images and color variants';
COMMENT ON COLUMN product_images.image_type IS 'Type of image: main (primary), hover (on hover), gallery (additional), color_variant (color options)';
COMMENT ON COLUMN product_images.color_name IS 'Color name for variant images (e.g., black, beige, pink)';