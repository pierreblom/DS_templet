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
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING
        },
        hover_image_url: {
            type: DataTypes.STRING
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        // Default scope excludes soft-deleted products
        defaultScope: {
            where: {
                isActive: true
            }
        },
        scopes: {
            // Include soft-deleted products
            withDeleted: {},
            // Only soft-deleted products
            deleted: {
                where: {
                    isActive: false
                }
            }
        }
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
