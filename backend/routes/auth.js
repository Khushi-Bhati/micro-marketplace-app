const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
require('dotenv').config();

const router = express.Router();


router.post(
    '/register',
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be 3-30 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password } = req.body;


            const existingUser = db
                .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
                .get(email, username);

            if (existingUser) {
                return res.status(409).json({ error: 'User already exists with this email or username' });
            }


            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);


            const result = db
                .prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
                .run(username, email, hashedPassword);

            const token = jwt.sign(
                { id: result.lastInsertRowid, username, email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: result.lastInsertRowid, username, email },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);


router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;


            const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

module.exports = router;
