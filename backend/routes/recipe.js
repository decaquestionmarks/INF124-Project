const express = require('express');
const router = express.Router();
const { searchRecipes, getRecipePreview, getRecipeById } = require('../controllers/recipe');

/**
 * GET /recipes/search?query=<text>
 * Returns recipes matching the query by name or description.
 */
router.get('/search', (req, res) => {
    try {
        const query = req.query.query;
        const result = searchRecipes(query);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /recipes/:id/preview
 * Returns lightweight preview data for a recipe card/list view.
 */
router.get('/:id/preview', (req, res) => {
    try {
        const recipeId = req.params.id;
        const preview = getRecipePreview(recipeId);
        res.json(preview);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * GET /recipes/:id
 * Retrieves a recipe by its ID
 * 
 * @param {string} id - The recipe ID
 * @returns {object} The recipe object or 404 error
 */
router.get('/:id', (req, res) => {
    try {
        const recipeId = req.params.id;

        // TODO: Validate the recipeId format (e.g., check if it's a valid MongoDB ObjectId)

        const recipe = getRecipeById(recipeId);
        res.json(recipe);

    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
