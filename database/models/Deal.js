const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Deal = sequelize.define('Deal', {
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
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'lead'
    },
    expected_close_date: {
        type: DataTypes.DATEONLY
    },
    probability: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'deals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Task = sequelize.define('Task', {
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
        allowNull: true
    },
    deal_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'todo'
    },
    due_date: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = { Deal, Task };
