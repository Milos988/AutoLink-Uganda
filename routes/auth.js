const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const JWT_SECRET = 'your_secret_key'; // Replace with env var in production

// ✅ REGISTER
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		const [existingUser] = await db.query('SELECT 1 FROM users WHERE email = ?', [email]);
		if (existingUser.length > 0) {
			return res.status(409).json({ message: 'Email already registered' });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const defaultRole = 1;         // seller_basic
		const defaultCredits = 5;
		const defaultVerified = 1;

		await db.query(
			'INSERT INTO users (name, email, password, role, credits, verified) VALUES (?, ?, ?, ?, ?, ?)',
			[name, email, hashedPassword, defaultRole, defaultCredits, defaultVerified]
		);

		res.status(201).json({ message: 'User registered successfully' });

	} catch (err) {
		console.error('Registration error:', err.message);
		res.status(500).json({ message: 'Server error' });
	}
});


// ✅ LOGIN
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
		if (rows.length === 0) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const user = rows[0];
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

		res.cookie('token', token, {
			httpOnly: true,
			secure: false, // Set to true in production (HTTPS)
			sameSite: 'Lax',
			maxAge: 2 * 60 * 60 * 1000
		}).json({ message: 'Login successful' });

	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


// ✅ PROFILE - Get current logged-in user's info
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const userId = req.user.id;

		const [rows] = await db.query(
			'SELECT name, email, role, credits FROM users WHERE id = ?',
			[userId]
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(rows[0]);
	} catch (err) {
		console.error('Profile error:', err.message);
		res.status(500).json({ message: 'Server error' });
	}
});


// ✅ LOGOUT
router.post('/logout', (req, res) => {
	res.clearCookie('token');
	res.json({ message: 'Logged out' });
});


// ✅ Export all routes
module.exports = router;
