const sequelize = require('./database');
const Product = require('./models/Product');
const Profile = require('./models/Profile');
const { Order, OrderItem } = require('./models/Order');
const AuditLog = require('./models/AuditLog');
const GuestCustomer = require('./models/GuestCustomer');

// Associations
// Profile.hasMany(Order, { foreignKey: 'user_id' }); // Optional, usually we just need Order -> Profile
Order.belongsTo(Profile, { foreignKey: 'user_id', constraints: false });
Order.belongsTo(GuestCustomer, { foreignKey: 'guest_id', constraints: false });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
    sequelize,
    Product,
    Profile,
    User: Profile, // Alias for backward compatibility
    Order,
    OrderItem,
    AuditLog,
    GuestCustomer
};
