const { pool } = require('../config/db');
const mysql = require('mysql2/promise'); // Import mysql2/promise for initial connection
const bcrypt = require('bcryptjs');

class User {
    static async initializeDatabase() {
        // Create a temporary connection without specifying a database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'db',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            port: process.env.DB_PORT || 3306,
        });

        try {
            // Create the database if it doesn’t exist
            const dbName = process.env.DB_NAME || 'admin_panel';
            await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
            console.log(`Database '${dbName}' ensured`);

            // Switch to the database (pool will use it from config)
            await connection.query(`USE ${dbName}`);
        } catch (error) {
            console.error('Error creating database:', error.message);
            throw error;
        } finally {
            await connection.end();
        }

        // Now create the table and admin user using the pool
        await this.createTable();
    }

    static async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                banned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        try {
            await pool.execute(query);
            console.log('Users table created or already exists');
            await this.createAdminUser();
        } catch (error) {
            console.error('Error creating users table:', error.message);
            throw error;
        }
    }

    static async createAdminUser() {
        const existingAdmin = await this.findByEmail('admin@example.com');
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('password', 10);
            await this.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    }

    static async create({ username, email, password, role }) {
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [username, email, password, role || 'user']);
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT id, username, email, role, banned, created_at FROM users WHERE id = ?', [id]);
            if (!rows[0]) throw new Error('User not found');
            return rows[0];
        } catch (error) {
            console.error('Error in findById:', error.message);
            throw error;
        }
    }

    static async getAll({ filter = {}, sort = {} }) {
        let query = 'SELECT id, username, email, role, banned, created_at FROM users WHERE 1=1';
        const params = [];

        if (filter.role) {
            query += ' AND role = ?';
            params.push(filter.role);
        }
        if (filter.username) {
            query += ' AND username LIKE ?';
            params.push(`%${filter.username}%`);
        }
        if (filter.email) {
            query += ' AND email LIKE ?';
            params.push(`%${filter.email}%`);
        }
        if (filter.banned !== undefined && filter.banned !== '') {
            const bannedValue = filter.banned === true || filter.banned === 'true' ? 1 : 0;
            query += ' AND banned = ?';
            params.push(bannedValue);
        }

        if (sort.field && ['username', 'email', 'created_at'].includes(sort.field)) {
            const direction = sort.direction === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sort.field} ${direction}`;
        }

        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database error in getAll:', error);
            throw error;
        }
    }

    static async update(id, data) {
        let query = 'UPDATE users SET ';
        const params = [];
        const fields = [];

        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            params.push(value);
        }
        query += fields.join(', ') + ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.execute(query, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async setBanStatus(id, banned) {
        const query = 'UPDATE users SET banned = ? WHERE id = ?';
        const [result] = await pool.execute(query, [banned, id]);
        return result.affectedRows;
    }
}

module.exports = User;

// Initialize the database and table on module load
User.initializeDatabase().catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
