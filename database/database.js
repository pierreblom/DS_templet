const { Sequelize } = require('sequelize');

// Supabase PostgreSQL connection
// Use DATABASE_URL for production (Supabase connection string)
// Falls back to individual env vars for flexibility

let sequelize;

const path = require('path');

// Use SQLite exclusively as the main database
sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

module.exports = sequelize;
