const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all brands
router.get('/brands', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT * FROM brands');
		res.json(rows);
	} catch (err) {
		console.error('Error fetching brands:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// ✅ GET models by brand ID
router.get('/models/:brandId', async (req, res) => {
	try {
		const [rows] = await db.query(
			'SELECT * FROM models WHERE brand_id = ?',
			[req.params.brandId]
		);
		res.json(rows);
	} catch (err) {
		console.error('Error fetching models:', err.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;
