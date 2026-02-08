const { Sequelize } = require('sequelize');

// Supabase PostgreSQL connection
// Use DATABASE_URL for production (Supabase connection string)
// Falls back to individual env vars for flexibility

let sequelize;

if (process.env.DATABASE_URL) {
    // Determine if we're connecting to localhost (no SSL needed)
    const isLocalhost =
        process.env.DATABASE_URL.includes('localhost') ||
        process.env.DATABASE_URL.includes('127.0.0.1');

    const dialectOptions = isLocalhost
        ? {}
        : {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for Supabase
            }
        };

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            // Increased from 1 to 5 to prevent ConnectionTerminated errors under load
            // While Vercel scales horizontally, a pool of 1 was too restrictive
            // and caused 500 errors. Monitor Supabase connection usage.
            max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Development fallback: Use individual environment variables
    sequelize = new Sequelize(
        process.env.DB_NAME || 'bra_shop',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

module.exports = sequelize;
