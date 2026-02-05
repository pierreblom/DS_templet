const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define(
    'Product',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        rating: {
            type: DataTypes.DECIMAL(2, 1),
            defaultValue: 5.0
        },
        category: {
            type: DataTypes.STRING
        },
        is_trail_favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_trail_favorite'
        },
        image_url: {
            type: DataTypes.STRING
        },
        hover_image_url: {
            type: DataTypes.STRING
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false, // Table only has created_at
        tableName: 'products'
    }
);

// Soft delete method
Product.prototype.softDelete = async function () {
    this.isActive = false;
    this.deletedAt = new Date();
    await this.save();
};

// Restore soft-deleted product
Product.prototype.restore = async function () {
    this.isActive = true;
    this.deletedAt = null;
    await this.save();
};

module.exports = Product;
