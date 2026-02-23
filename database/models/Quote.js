const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    client_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quote_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft'
    },
    expiry_date: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'quotes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Budget = sequelize.define('Budget', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    project_name: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'planned'
    },
    start_date: {
        type: DataTypes.DATEONLY
    },
    end_date: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'budgets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = { Quote, Budget };
