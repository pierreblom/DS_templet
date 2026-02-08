const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ProductImage = sequelize.define(
    'ProductImage',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        image_type: {
            type: DataTypes.STRING(50),
            defaultValue: 'gallery',
            comment: 'Type: main, hover, gallery, color_variant'
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        alt_text: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        color_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Color name for variant images (e.g., black, beige, pink)'
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        tableName: 'product_images',
        indexes: [
            {
                fields: ['product_id']
            },
            {
                fields: ['image_type']
            },
            {
                unique: true,
                fields: ['product_id', 'image_url']
            }
        ]
    }
);

module.exports = ProductImage;
