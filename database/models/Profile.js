const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const bcrypt = require('bcrypt');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Display name for the user'
    },
    first_name: {
        type: DataTypes.STRING
    },
    last_name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nullable for Google OAuth users'
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'customer',
        allowNull: false,
        validate: {
            isIn: [['customer', 'admin']]
        }
    },
    address: {
        type: DataTypes.STRING
    },
    apartment: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    postal_code: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
    tableName: 'profiles',
    hooks: {
        beforeCreate: async (profile) => {
            // Hash password if it exists (not for OAuth users)
            if (profile.password_hash && !profile.password_hash.startsWith('$2a$')) {
                const salt = await bcrypt.genSalt(10);
                profile.password_hash = await bcrypt.hash(profile.password_hash, salt);
            }
        },
        beforeUpdate: async (profile) => {
            // Hash password if it was changed
            if (profile.changed('password_hash') && profile.password_hash && !profile.password_hash.startsWith('$2a$')) {
                const salt = await bcrypt.genSalt(10);
                profile.password_hash = await bcrypt.hash(profile.password_hash, salt);
            }
        }
    }
});

// Instance method to validate password
Profile.prototype.validatePassword = async function (plainTextPassword) {
    if (!this.password_hash) {
        return false; // OAuth users don't have passwords
    }
    return await bcrypt.compare(plainTextPassword, this.password_hash);
};

module.exports = Profile;
