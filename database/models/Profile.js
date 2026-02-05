const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING
    },
    last_name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
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
    createdAt: false, // profiles usually managed by Supabase triggers? checking schema, it has updated_at, maybe no created_at? schema showed updated_at.
    updatedAt: 'updated_at',
    tableName: 'profiles'
});

module.exports = Profile;
