require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupLocalDb() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    };

    const targetDbName = process.env.DB_NAME || 'bra_shop_local';

    // 1. Connect to default 'postgres' database to check/create target database
    console.log(`Connecting to postgres to check if database '${targetDbName}' exists...`);
    const rootClient = new Client({
        ...dbConfig,
        database: 'postgres',
    });

    try {
        await rootClient.connect();
        
        const res = await rootClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [targetDbName]
        );

        if (res.rowCount === 0) {
            console.log(`Database '${targetDbName}' does not exist. Creating...`);
            await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`Database '${targetDbName}' created.`);
        } else {
            console.log(`Database '${targetDbName}' already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await rootClient.end();
    }

    // 2. Connect to the target database and run init script
    console.log(`Connecting to '${targetDbName}' to run initialization script...`);
    const client = new Client({
        ...dbConfig,
        database: targetDbName,
    });

    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'init_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running init_db.sql...');
        await client.query(sql);
        console.log('Initialization complete.');

    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupLocalDb();
