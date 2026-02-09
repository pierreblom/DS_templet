const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'unsubscribed'),
        defaultValue: 'active',
        allowNull: false
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true // This will make created_at and updated_at map to createdAt and updatedAt in JS if not explicitly defined, but here they are explicitly defined in the object. wait, usually underscored: true handles snake_case <-> camelCase mapping. Let's check GuestCustomer.
});

module.exports = Subscription;
