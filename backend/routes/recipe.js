const express = require('express');
const router = express.Router();
const { searchRecipes, getRecipePreview, getRecipeById, createRecipe, attachRecommendedRecipes, deleteRecipe, updateRecipe } = require('../controllers/recipe');
const { attachUser } = require('../controllers/user');
const Recipe = require('../../models/recipe');

/**
 * POST /recipes
 * Creates a recipe from the JSON request body.
 */
router.post('/', (req, res) => {
    try {
        const recipe = new Recipe(
            req.body.name,
            req.body.description,
            req.body.foods,
            req.body.steps
        );

        const createdRecipe = createRecipe(recipe);
        res.status(201).json(createdRecipe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

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
 * GET /recipes/recommended
 * Returns recipes the current user can make from their fridge items.
 */
router.get('/recommended', attachUser, attachRecommendedRecipes, (req, res) => {
    res.json({
        count: req.recommendedRecipes.length,
        results: req.recommendedRecipes,
    });
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

        // TODO: Validate the recipeId format (e.g., check if it''s a valid MongoDB ObjectId)

        const recipe = getRecipeById(recipeId);
        res.json(recipe);

    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * PUT /recipes/:id
 * Updates a recipe by ID with new data (name, description, foods, steps).
 */
router.put('/:id', (req, res) => {
    try {
        const recipeId = req.params.id;
        const updated = updateRecipe(recipeId, req.body);
        res.json(updated);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * DELETE /recipes/:id
 * Deletes a recipe by ID.
 */
router.delete('/:id', (req, res) => {
    try {
        const recipeId = req.params.id;
        const deleted = deleteRecipe(recipeId);
        res.json({ message: 'Recipe deleted', deleted });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
