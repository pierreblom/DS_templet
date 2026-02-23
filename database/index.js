const sequelize = require('./database');
const Profile = require('./models/Profile');
const Client = require('./models/Client');
const { Invoice, InvoiceItem } = require('./models/Invoice');
const { Quote, Budget } = require('./models/Quote');
const Payment = require('./models/Payment');
const { Deal, Task } = require('./models/Deal');
const Subscription = require('./models/Subscription');
const Product = require('./models/Product'); // Keep for potential use in items

// ===================
// Associations
// ===================

// 1. Profile / User Associations (Ownership)
Profile.hasMany(Client, { foreignKey: 'user_id' });
Client.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Quote, { foreignKey: 'user_id' });
Quote.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Budget, { foreignKey: 'user_id' });
Budget.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Deal, { foreignKey: 'user_id' });
Deal.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Task, { foreignKey: 'user_id' });
Task.belongsTo(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(Profile, { foreignKey: 'user_id' });

// 2. Client Associations
Client.hasMany(Invoice, { foreignKey: 'client_id' });
Invoice.belongsTo(Client, { foreignKey: 'client_id' });

Client.hasMany(Quote, { foreignKey: 'client_id' });
Quote.belongsTo(Client, { foreignKey: 'client_id' });

Client.hasMany(Deal, { foreignKey: 'client_id' });
Deal.belongsTo(Client, { foreignKey: 'client_id' });

Client.hasMany(Subscription, { foreignKey: 'client_id' });
Subscription.belongsTo(Client, { foreignKey: 'client_id' });

Client.hasMany(Task, { foreignKey: 'client_id' });
Task.belongsTo(Client, { foreignKey: 'client_id' });

// 3. Invoice / Payment Associations
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });

Invoice.hasMany(Payment, { foreignKey: 'invoice_id' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id' });

// 4. Deal / Task Associations
Deal.hasMany(Task, { foreignKey: 'deal_id' });
Task.belongsTo(Deal, { foreignKey: 'deal_id' });

module.exports = {
    sequelize,
    Profile,
    User: Profile, // Alias
    Client,
    Invoice,
    InvoiceItem,
    Quote,
    Budget,
    Payment,
    Deal,
    Task,
    Subscription,
    Product
};
