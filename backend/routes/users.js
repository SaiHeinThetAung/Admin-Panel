const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all users with filter and sort
router.get('/', async (req, res) => {
    try {
        const { role, username, email, banned, sortBy, sortDir } = req.query;
        const filter = { role, username, email, banned }; // Pass banned as is
        const sort = sortBy ? { field: sortBy, direction: sortDir || 'asc' } : {};

        const users = await User.getAll({ filter, sort });
        res.json(users);
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Create user with validation
router.post('/', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password, role } = req.body;
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await User.create({ username, email, password: hashedPassword, role });
        res.status(201).json({ message: 'User created', userId });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
});

// Update user with validation
router.put('/:id', [
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const affectedRows = await User.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// Ban/Unban user
router.patch('/:id/ban', async (req, res) => {
    try {
        const { ban } = req.body;
        if (typeof ban !== 'boolean') {
            return res.status(400).json({ message: 'Ban status must be boolean' });
        }
        const affectedRows = await User.setBanStatus(req.params.id, ban);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: `User ${ban ? 'banned' : 'unbanned'}` });
    } catch (error) {
        res.status(400).json({ message: 'Error updating ban status', error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await User.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const loggedInUser = req.user; // From authMiddleware

        // Restrict access: Only admins or the user themselves can view their info
        if (loggedInUser.role !== 'admin' && loggedInUser.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return only necessary fields
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        });
    } catch (error) {
        console.error('Error in GET /api/users/:id:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

module.exports = router;