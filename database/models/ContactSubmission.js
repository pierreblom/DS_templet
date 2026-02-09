const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ContactSubmission = sequelize.define('ContactSubmission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'responded', 'archived'),
        defaultValue: 'new',
        allowNull: false
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
    tableName: 'contact_submissions',
    timestamps: true,
    underscored: true
});

module.exports = ContactSubmission;
