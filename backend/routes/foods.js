const express = require('express');
const { searchFoods, getFoodByIdentifier, getAllFoods, createFood } = require('../controllers/food');

const router = express.Router();

// GET /foods
router.get('/', async (req, res) => {
	try {
		const results = await getAllFoods();
		res.json({ count: results.length, results });
	} catch (error) {
		res.status(error.statusCode || 500).json({ error: error.message });
	}
});

// GET /foods/search?query=banana
router.get('/search', async (req, res) => {
	try {
		const query = req.query.query || '';
		const results = await searchFoods(query);
		res.json({ query: query.toString().trim().toLowerCase(), count: results.length, results });
	} catch (error) {
		res.status(error.statusCode || 400).json({ error: error.message });
	}
});

// GET /foods/:identifier
router.get('/:identifier', async (req, res) => {
	try {
		const food = await getFoodByIdentifier(req.params.identifier);
		res.json(food);
	} catch (error) {
		res.status(error.statusCode || 404).json({ error: error.message });
	}
});

router.post('/', createFood);

module.exports = router;
