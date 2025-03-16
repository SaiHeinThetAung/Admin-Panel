const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root', // Match docker-compose.yml
    database: process.env.DB_NAME || 'admin_panel',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
});

const connectDB = async () => {
    let tempConnection;
    const maxRetries = 10;
    let attempts = 0;

    // Retry connecting to MySQL without database specified
    while (attempts < maxRetries) {
        try {
            tempConnection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'root',
                port: process.env.DB_PORT || 3306,
            });
            console.log('MySQL connected');
            break;
        } catch (error) {
            attempts++;
            console.error(`Connection attempt ${attempts} failed:`, error.message);
            if (attempts === maxRetries) {
                throw new Error('Max retries reached. Could not connect to MySQL.');
            }
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
        }
    }

    try {
        // Create database if it doesn’t exist
        const dbName = process.env.DB_NAME || 'admin_panel';
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database '${dbName}' ensured`);
    } catch (error) {
        console.error('Failed to create database:', error);
        throw error;
    } finally {
        if (tempConnection) await tempConnection.end();
    }

    // Verify pool connection
    try {
        const connection = await pool.getConnection();
        console.log('MySQL pool connected to admin_panel');
        connection.release();
    } catch (error) {
        console.error('Pool connection failed:', error);
        throw error;
    }
};

module.exports = { connectDB, pool };