const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define('Order', {
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
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
        defaultValue: 'pending'
    },
    shipping_address: {
        type: DataTypes.JSON
    },
    payment_intent_id: {
        type: DataTypes.STRING
    }
});

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
