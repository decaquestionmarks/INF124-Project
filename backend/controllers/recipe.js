const Recipe = require('../models/recipe');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/recipes', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', () => {console.log('Connected to MongoDB') });

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    foods: [{
        name: { type: String, required: true },
        classification: { type: String, required: true },
        measurementClassification: { type: String, required: true },
        measurement: { type: Number, required: true }
    }],
    steps: [{ type: String, required: true }]
});

const Recipe = mongoose.model('Recipe', recipeSchema);

app.get('/', (req, res) => {
    res.send("Hello World!>");
});

app.post('/recipes', (req, res) => {
    const newRec = new Recipe(req.body);

    newRec.save((err, savedRecipe) => {
        if (err) {
            console.error('Error saving recipe:', err);
            return res.status(500).json({ error: 'Failed to save recipe' });
        }
        res.status(201).json(savedRecipe);
    });
});

app.get('/recipes', (req, res) => {
    Recipe.find({}, (err, recipes) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ error: 'Failed to fetch recipes' });
        }
        res.status(200).send(recipes);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
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
        description: 'Quick weeknight Mock stir fry with vegetables.',
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
 * Search for recipes by query string
 * @param {string} query - Search query to match against name and description
 * @returns {object} - { query, results, count }
 * @throws {Error} - If no query provided
 */
const searchRecipes = (query) => {
    if (!query) {
        throw new Error('Query parameter "query" is required');
    }

    //MOCK: replace with Database query in production
    const normalizedQuery = query.toString().trim().toLowerCase();
    const results = mockRecipes.filter((recipe) => {
        return recipe.name.toLowerCase().includes(normalizedQuery)
            || recipe.description.toLowerCase().includes(normalizedQuery);
    });
    
    
    return { query: normalizedQuery, results, count: results.length };
};

/**
 * Get a recipe preview by ID
 * @param {string} recipeId - The recipe ID
 * @returns {object} - Preview object with id, name, and image
 * @throws {Error} - If recipe not found
 */
const getRecipePreview = (recipeId) => {
    //MOCK: replace with Database query in production
    const recipe = mockRecipes.find((item) => item.id === recipeId);

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return {
        id: recipe.id,
        name: recipe.name,
        image: recipe.foods.length > 0 ? `https://example.com/images/${recipe.foods[0].name.toLowerCase().replace(/\s+/g, '-')}.jpg` : null,
    };
};

/**
 * Get a full recipe by ID
 * @param {string} recipeId - The recipe ID
 * @returns {object} - Full recipe object
 * @throws {Error} - If recipe not found
 */
const getRecipeById = (recipeId) => {
    //MOCK: replace with Database query in production
    const recipe = mockRecipes.find((item) => item.id === recipeId);

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return recipe;
};

const nextID = () => {
    const maxId = mockRecipes.reduce((highestId, recipe) => {
        const numericId = Number.parseInt(recipe.id, 10);
        return Number.isFinite(numericId) && numericId > highestId ? numericId : highestId;
    }, 0);

    return String(maxId + 1);
};

/**
 * Create a recipe from a request payload
 * @param {Recipe} recipe - Recipe object from the model
 * @returns {object} - The created recipe with an id
 * @throws {Error} - If the payload is missing or invalid
 */
const createRecipe = (recipe) => {
    if (!(recipe instanceof Recipe)) {
        throw new Error('Recipe payload must be a Recipe object');
    }

    const createdRecipe = {
        id: nextID(),
        ...recipe,
    };

    mockRecipes.push(createdRecipe);

    return createdRecipe;
};

module.exports = {
    searchRecipes,
    getRecipePreview,
    getRecipeById,
    createRecipe,
};
