const express = require('express');
const router = express.Router();
const { searchRecipes, getRecipePreview, getRecipeById, createRecipe, attachRecommendedRecipes, deleteRecipe, updateRecipe, getRecipesForOwner } = require('../controllers/recipe');
const { attachUser } = require('../controllers/user');
const { requireAuth } = require('../services/auth');
const Recipe = require('../../models/recipe');

/**
 * POST /recipes
 * Creates a recipe from the JSON request body.
 */
router.post('/', requireAuth, attachUser, (req, res) => {
    (async () => {
        const recipe = new Recipe(
            req.body.name,
            req.body.description,
            req.body.foods,
            req.body.steps
        );

        const createdRecipe = await createRecipe(recipe, req.appUser.id);
        res.status(201).json(createdRecipe);
    })().catch((error) => {
        res.status(400).json({ error: error.message });
    });
});

/**
 * GET /recipes/search?query=<text>
 * Returns recipes matching the query by name or description.
 */
router.get('/search', (req, res) => {
    (async () => {
        const query = req.query.query;
        const result = await searchRecipes(query);
        res.json(result);
    })().catch((error) => {
        res.status(400).json({ error: error.message });
    });
});

/**
 * GET /recipes/recommended
 * Returns recipes the current user can make from their fridge items.
 */
router.get('/recommended', requireAuth, attachUser, attachRecommendedRecipes, (req, res) => {
    res.json({
        count: req.recommendedRecipes.length,
        results: req.recommendedRecipes,
    });
});

/**
 * GET /recipes/me
 * Returns recipe previews created by the current user.
 */
router.get('/me', requireAuth, attachUser, (req, res) => {
    (async () => {
        res.json(await getRecipesForOwner(req.appUser.id));
    })().catch((error) => {
        res.status(error.statusCode || 400).json({ error: error.message });
    });
});

/**
 * GET /recipes/:id/preview
 * Returns lightweight preview data for a recipe card/list view.
 */
router.get('/:id/preview', (req, res) => {
    (async () => {
        const recipeId = req.params.id;
        const preview = await getRecipePreview(recipeId);
        res.json(preview);
    })().catch((error) => {
        res.status(404).json({ error: error.message });
    });
});

/**
 * GET /recipes/:id
 * Retrieves a recipe by its ID
 * 
 * @param {string} id - The recipe ID
 * @returns {object} The recipe object or 404 error
 */
router.get('/:id', (req, res) => {
    (async () => {
        const recipeId = req.params.id;
        const recipe = await getRecipeById(recipeId);
        res.json(recipe);
    })().catch((error) => {
        res.status(404).json({ error: error.message });
    });
});

/**
 * PUT /recipes/:id
 * Updates a recipe by ID with new data (name, description, foods, steps).
 */
router.put('/:id', requireAuth, attachUser, (req, res) => {
    (async () => {
        const recipeId = req.params.id;
        const updated = await updateRecipe(recipeId, req.body, req.appUser.id);
        res.json(updated);
    })().catch((error) => {
        res.status(error.statusCode || 404).json({ error: error.message });
    });
});

/**
 * DELETE /recipes/:id
 * Deletes a recipe by ID.
 */
router.delete('/:id', requireAuth, attachUser, (req, res) => {
    (async () => {
        const recipeId = req.params.id;
        const deleted = await deleteRecipe(recipeId, req.appUser.id);
        res.json({ message: 'Recipe deleted', deleted });
    })().catch((error) => {
        res.status(error.statusCode || 404).json({ error: error.message });
    });
});

module.exports = router;
