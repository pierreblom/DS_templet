const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GuestCustomer = sequelize.define('GuestCustomer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shipping_address: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'guest_customers',
    timestamps: true,
    underscored: true
});

module.exports = GuestCustomer;
