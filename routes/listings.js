const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Route 1: Get ALL listings
router.get('/', async (req, res) => {
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

// ✅ Route 2: Get FEATURED listings only
router.get('/featured', async (req, res) => {
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
		// 👉 This will show the actual issue in terminal
		console.error('FEATURED ERROR:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});


// ✅ Route 3: SEARCH listings by filters
router.get('/search', async (req, res) => {
	const { brand, model, yearFrom, yearTo } = req.query;

	let sql = `
    SELECT listings.*, brands.name AS brand_name, models.name AS model_name
    FROM listings
    JOIN brands ON listings.brand_id = brands.id
    JOIN models ON listings.model_id = models.id
    WHERE 1 = 1
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

module.exports = router;


// Test Add Listing
const multer = require('multer');
const path = require('path');

// ✅ Set up Multer for image uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/images'));
	},
	filename: function (req, file, cb) {
		const uniqueName = Date.now() + '-' + file.originalname;
		cb(null, uniqueName);
	}
});

const upload = multer({ storage: storage });

// ✅ POST route to create a listing
router.post('/', upload.single('image'), async (req, res) => {
	try {
		const {
			brand_id,
			model_id,
			year,
			price,
			location,
			vehicle_condition,
			featured
		} = req.body;

		const image_url = '/images/' + req.file.filename;

		// Try insert and capture result
		const [result] = await db.query(
			`INSERT INTO listings (
        brand_id, model_id, year, price,
        location, image_url, vehicle_condition, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				brand_id,
				model_id,
				year,
				price,
				location,
				image_url,
				vehicle_condition,
				featured
			]
		);

		console.log('Insert result:', result);

		if (result.affectedRows === 1) {
			res.json({ message: 'Listing created successfully!' });
		} else {
			res.status(500).json({ error: 'Insert failed' });
		}
	} catch (err) {
		console.error('Error creating listing:', err.message);
		res.status(500).json({ error: 'Failed to create listing' });
	}
});
