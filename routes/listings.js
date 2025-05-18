const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware');

// Multer setup for image upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/images')),
	filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET /api/brands - Return all brands
router.get('/brands', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT id, name FROM brands ORDER BY name ASC');
		res.json(rows);
	} catch (err) {
		console.error('Error fetching brands:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/models?brand_id=1 - Return models for selected brand
router.get('/models', async (req, res) => {
	const { brand_id } = req.query;
	if (!brand_id) return res.status(400).json({ error: 'Missing brand_id parameter' });

	try {
		const [rows] = await db.query('SELECT id, name FROM models WHERE brand_id = ?', [brand_id]);
		res.json(rows);
	} catch (err) {
		console.error('Error fetching models:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/listings - All listings
router.get('/listings', async (req, res) => {
	try {
		const [rows] = await db.query(`
            SELECT listings.*, brands.name AS brand_name, models.name AS model_name
            FROM listings
                     JOIN brands ON listings.brand_id = brands.id
                     JOIN models ON listings.model_id = models.id
		`);
		res.json(rows);
	} catch (err) {
		console.error('Error fetching listings:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/listings/featured
router.get('/listings/featured', async (req, res) => {
	try {
		const [rows] = await db.query(`
      SELECT listings.*, brands.name AS brand_name, models.name AS model_name
      FROM listings
      JOIN brands ON listings.brand_id = brands.id
      JOIN models ON listings.model_id = models.id
      WHERE listings.featured = 1
    `);
		res.json(rows);
	} catch (err) {
		console.error('FEATURED ERROR:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/listings/user/:id
router.get('/listings/user/:id', authenticateToken, async (req, res) => {
	const userId = req.params.id;
	if (req.user.id != userId) return res.status(403).json({ error: 'Access denied' });

	try {
		const [rows] = await db.query(`
      SELECT listings.*, brands.name AS brand_name, models.name AS model_name
      FROM listings
      JOIN brands ON listings.brand_id = brands.id
      JOIN models ON listings.model_id = models.id
      WHERE listings.user_id = ?
    `, [userId]);

		res.json(rows);
	} catch (err) {
		console.error('Error fetching user listings:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/listings/search
router.get('/listings/search', async (req, res) => {
	const { brand, model, yearFrom, yearTo } = req.query;

	let sql = `
    SELECT listings.*, brands.name AS brand_name, models.name AS model_name
    FROM listings
    JOIN brands ON listings.brand_id = brands.id
    JOIN models ON listings.model_id = models.id
    WHERE 1=1
  `;
	const params = [];

	if (brand) {
		sql += ' AND listings.brand_id = ?';
		params.push(brand);
	}
	if (model) {
		sql += ' AND listings.model_id = ?';
		params.push(model);
	}
	if (yearFrom) {
		sql += ' AND listings.year >= ?';
		params.push(yearFrom);
	}
	if (yearTo) {
		sql += ' AND listings.year <= ?';
		params.push(yearTo);
	}

	try {
		const [rows] = await db.query(sql, params);
		res.json(rows);
	} catch (err) {
		console.error('Search error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/users/:id/credits
router.get('/users/:id/credits', authenticateToken, async (req, res) => {
	const userId = req.params.id;
	if (req.user.id != userId) return res.status(403).json({ error: 'Access denied' });

	try {
		const [rows] = await db.query('SELECT credits FROM users WHERE id = ?', [userId]);
		if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

		res.json({ credits: rows[0].credits });
	} catch (err) {
		console.error('Error fetching user credits:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// POST /api/listings - Create new listing
router.post('/listings', authenticateToken, upload.single('image'), async (req, res) => {
	const {
		brand_id, model_id, year, location,
		vehicle_condition, price
	} = req.body;

	const userId = req.user.id;
	const featured = 0;
	const image_url = req.file ? `/images/${req.file.filename}` : null;

	try {
		const [userRows] = await db.query('SELECT credits FROM users WHERE id = ?', [userId]);
		if (userRows.length === 0) {
			return res.status(404).json({ message: 'User not found' });
		}
		if (userRows[0].credits <= 0) {
			return res.status(403).json({ message: 'You have 0 credits. Please purchase more to add a listing.' });
		}

		await db.query(`
      INSERT INTO listings
      (brand_id, model_id, year, location, image_url, vehicle_condition, price, user_id, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [brand_id, model_id, year, location, image_url, vehicle_condition, price, userId, featured]);

		await db.query('UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0', [userId]);

		res.status(201).json({ message: 'Listing added successfully' });
	} catch (err) {
		console.error('Add listing error:', err.message);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
