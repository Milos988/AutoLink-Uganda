const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/brands
router.get('/', async (req, res) => {
	try {
		const [brands] = await db.query('SELECT id, name FROM brands ORDER BY name');
		res.json(brands);
	} catch (err) {
		console.error('Error loading brands:', err);
		res.status(500).json({ error: 'Failed to load brands' });
	}
});

// GET /api/brands/models?brand_id=1
router.get('/models', async (req, res) => {
	const brandId = parseInt(req.query.brand_id);
	if (!brandId || isNaN(brandId)) {
		return res.status(400).json({ error: 'Missing or invalid brand ID' });
	}

	try {
		const [models] = await db.query(
			'SELECT id, name FROM models WHERE brand_id = ? ORDER BY name',
			[brandId]
		);
		res.json(models);
	} catch (err) {
		console.error('Error loading models:', err);
		res.status(500).json({ error: 'Failed to load models' });
	}
});

module.exports = router;
