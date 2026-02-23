const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Invoice = sequelize.define('Invoice', {
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
    invoice_number: {
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
    due_date: {
        type: DataTypes.DATEONLY
    },
    currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    invoice_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 1
    },
    unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    total_price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'invoice_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = { Invoice, InvoiceItem };
