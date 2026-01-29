const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define(
    'Order',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
            defaultValue: 'pending'
        },
        shipping_address: {
            type: DataTypes.JSON
        },
        payment_intent_id: {
            type: DataTypes.STRING
        },
        tracking_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        shipped_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        delivered_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = { Order, OrderItem };
