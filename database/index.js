const sequelize = require('./database');
const Product = require('./models/Product');
const User = require('./models/User');
const { Order, OrderItem } = require('./models/Order');
const AuditLog = require('./models/AuditLog');

// Associations
User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = {
    sequelize,
    Product,
    User,
    Order,
    OrderItem,
    AuditLog
};
