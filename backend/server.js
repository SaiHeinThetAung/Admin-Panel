const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { connectDB } = require('./config/db');

// Verify User import
let User;
try {
    User = require('./models/User');
    console.log('User model imported successfully');
} catch (error) {
    console.error('Failed to import User model:', error);
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database and Initialize Tables
const initializeApp = async () => {
    try {
        await connectDB(); // Connect to MySQL and create database
        await User.createTable(); // Create the users table and seed admin
        console.log('Database and tables initialized successfully');
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
};

// Run initialization
initializeApp();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});