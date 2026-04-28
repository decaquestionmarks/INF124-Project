const express = require('express');
const router = express.Router();

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
        const recipe = {
            id: recipeId,
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
        };

        // TODO: Check if recipe exists
        // if (!recipe) {
        //     return res.status(404).json({ error: 'Recipe not found' });
        // }

        // TODO: Return the recipe
        res.json(recipe);

    } catch (error) {
        // TODO: Handle errors appropriately
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;
