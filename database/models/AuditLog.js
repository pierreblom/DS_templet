/**
 * Audit Log Model
 * Following xneelo auditing guidelines with 5+ year retention
 * Logs all create, update, and delete actions
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AuditLog = sequelize.define(
    'AuditLog',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        traceId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'trace_id'
        },
        sourceIp: {
            type: DataTypes.STRING(45), // IPv6 compatible
            allowNull: true,
            field: 'source_ip'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_id'
        },
        userEmail: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'user_email'
        },
        endpoint: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        method: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM('create', 'update', 'delete'),
            allowNull: false
        },
        entityType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'entity_type'
        },
        entityId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'entity_id'
        },
        params: {
            type: DataTypes.JSON,
            allowNull: true
        },
        previousState: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'previous_state'
        },
        newState: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'new_state'
        }
    },
    {
        tableName: 'audit_logs',
        timestamps: false, // We use our own timestamp field
        indexes: [
            { fields: ['timestamp'] },
            { fields: ['user_id'] },
            { fields: ['entity_type', 'entity_id'] },
            { fields: ['trace_id'] }
        ]
    }
);

module.exports = AuditLog;
