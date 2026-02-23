require('dotenv').config();
const {
    sequelize,
    Profile,
    Client,
    Invoice,
    InvoiceItem,
    Deal,
    Task,
    Subscription
} = require('../database/index');

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully.');

        console.log('Syncing database schema...');
        await sequelize.sync({ force: true }); // Reset database with associations

        console.log('Creating admin user...');
        const adminUser = await Profile.create({
            email: 'admin@crm-system.com',
            password_hash: 'Admin123!', // Profile hook handles hashing
            name: 'Admin User',
            role: 'admin'
        });
        console.log(`Admin user created: ${adminUser.email}`);

        console.log('Creating sample clients...');
        const client1 = await Client.create({
            user_id: adminUser.id,
            name: 'Tech Solutions Inc.',
            email: 'contact@techsolutions.com',
            phone: '+1-555-1234',
            vat_number: 'VAT123456789',
            address: '123 Innovation Way',
            city: 'San Francisco',
            country: 'USA'
        });

        const client2 = await Client.create({
            user_id: adminUser.id,
            name: 'Global Logistics Ltd.',
            email: 'billing@globallogistics.co',
            phone: '+44-20-7946-0958',
            address: '45 Export St',
            city: 'London',
            country: 'UK'
        });
        console.log('Clients created.');

        console.log('Creating sample invoices...');
        const invoice1 = await Invoice.create({
            user_id: adminUser.id,
            client_id: client1.id,
            invoice_number: 'INV-2026-001',
            amount: 1500.00,
            status: 'sent',
            due_date: '2026-03-01',
            currency: 'USD'
        });

        await InvoiceItem.create({
            invoice_id: invoice1.id,
            description: 'Cloud Infrastructure Setup',
            quantity: 1,
            unit_price: 1000.00,
            total_price: 1000.00
        });

        await InvoiceItem.create({
            invoice_id: invoice1.id,
            description: 'Security Audit (Level 1)',
            quantity: 1,
            unit_price: 500.00,
            total_price: 500.00
        });
        console.log('Invoice 1 created.');

        console.log('Creating sample deals and tasks...');
        const deal1 = await Deal.create({
            user_id: adminUser.id,
            client_id: client2.id,
            name: 'Q3 Software Expansion',
            value: 25000.00,
            status: 'negotiation',
            expected_close_date: '2026-04-15',
            probability: 60
        });

        await Task.create({
            user_id: adminUser.id,
            client_id: client2.id,
            deal_id: deal1.id,
            title: 'Send Revised Proposal',
            description: 'Apply the 10% discount discussed in the last meeting.',
            status: 'todo',
            due_date: new Date(Date.now() + 86400000 * 2) // In 2 days
        });

        await Task.create({
            user_id: adminUser.id,
            client_id: client1.id,
            title: 'Quarterly Review Meeting',
            status: 'todo',
            due_date: new Date(Date.now() + 86400000 * 7) // In 7 days
        });
        console.log('Deals and tasks created.');

        console.log('Creating sample subscription...');
        await Subscription.create({
            user_id: adminUser.id,
            client_id: client1.id,
            plan_name: 'Premium Support Plan',
            amount: 199.99,
            status: 'active',
            interval: 'month',
            next_payment_at: new Date(Date.now() + 86400000 * 30)
        });

        console.log('\n=== Database seeded successfully with CRM data! ===');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@crm-system.com');
        console.log('Password: Admin123!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
