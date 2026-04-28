const express = require('express');
const router = express.Router();

// MOCK: Replace this with database-backed queries in production.
const mockRecipes = [
    {
        id: '1',
        name: 'Mock Recipe',
        description: 'This is a mock recipe for testing purposes.',
        foods: [
            {
                name: 'Mock Food',
                classification: 'Mock Classification',
                measurementClassification: 'lbs',
                measurement: 1.0
            }
        ],
        steps: [
            'Step 1: Preheat the oven to 350°F.',
            'Step 2: Mix the ingredients together.',
            'Step 3: Bake for 30 minutes.'
        ]
    },
    {
        id: '2',
        name: 'Chicken Stir Fry',
        description: 'Quick weeknight stir fry with vegetables.',
        foods: [
            {
                name: 'Chicken Breast',
                classification: 'Protein',
                measurementClassification: 'lbs',
                measurement: 1.5
            },
            {
                name: 'Broccoli',
                classification: 'Vegetable',
                measurementClassification: 'cups',
                measurement: 2
            }
        ],
        steps: [
            'Step 1: Slice chicken and vegetables.',
            'Step 2: Stir fry chicken until cooked.',
            'Step 3: Add vegetables and sauce, then serve.'
        ]
    }
];

/**
 * GET /recipes/search?query=<text>
 * Returns recipes matching the query by name or description.
 */
router.get('/search', (req, res) => {
    try {
        const query = (req.query.query || '').toString().trim().toLowerCase();

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required' });
        }


        //Mock search logic - replace with actual database search in production
        const results = mockRecipes.filter((recipe) => {
            return recipe.name.toLowerCase().includes(query)
                || recipe.description.toLowerCase().includes(query);
        });
        //
        res.json({ query, results, count: results.length });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

/**
 * GET /recipes/:id/preview
 * Returns lightweight preview data for a recipe card/list view.
 */
router.get('/:id/preview', (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = mockRecipes.find((item) => item.id === recipeId);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const preview = {
            id: recipe.id,
            name: recipe.name,
            image: recipe.foods.length > 0 ? `https://example.com/images/${recipe.foods[0].name.toLowerCase().replace(/\s+/g, '-')}.jpg` : null,
        };

        res.json(preview);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
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

        // TODO: Fetch the recipe from the database using recipeId
        // const recipe = await Recipe.findById(recipeId);
        
        //MOCK: Simulate fetching a recipe (replace with actual database call)
        const recipe = mockRecipes.find((item) => item.id === recipeId);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // TODO: Return the recipe
        res.json(recipe);

    } catch (error) {
        // TODO: Handle errors appropriately
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;
