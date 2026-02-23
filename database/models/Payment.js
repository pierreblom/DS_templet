const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    invoice_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING
    },
    payment_id: {
        type: DataTypes.STRING,
        comment: 'External transaction ID'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'completed'
    },
    payment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Payment;
