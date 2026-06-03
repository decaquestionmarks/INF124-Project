const Recipe = require('../../models/recipe');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// app.use(bodyParser.json());

// mongoose.connect('mongodb://localhost:27017/recipes');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', () => {console.log('Connected to MongoDB') });

// const recipeSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     foods: [{
//         name: { type: String, required: true },
//         classification: { type: String, required: true },
//         measurementClassification: { type: String, required: true },
//         measurement: { type: Number, required: true }
//     }],
//     steps: [{ type: String, required: true }]
// });

// const Recipe = mongoose.model('Recipe', recipeSchema);

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

const normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const getIngredientName = (ingredient) => normalizeName(ingredient && ingredient.name);

const getRecipeRecommendations = (fridgeItems = []) => {
    const fridgeNames = new Set(
        fridgeItems
            .map((item) => normalizeName(item && item.name))
            .filter(Boolean)
    );

    return mockRecipes.filter((recipe) => {
        if (!Array.isArray(recipe.foods) || recipe.foods.length === 0) {
            return false;
        }

        return recipe.foods.every((ingredient) => fridgeNames.has(getIngredientName(ingredient)));
    }).map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        foods: recipe.foods,
        steps: recipe.steps,
    }));
};

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

const toRecipePreview = (recipe) => ({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    image: Array.isArray(recipe.foods) && recipe.foods.length > 0
        ? `https://example.com/images/${recipe.foods[0].name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        : null,
});

const getRecipesForOwner = (ownerId) => {
    if (!ownerId) {
        const error = new Error('Owner ID is required');
        error.statusCode = 401;
        throw error;
    }

    const results = mockRecipes
        .filter((recipe) => recipe.ownerId === ownerId)
        .map(toRecipePreview);

    return { results, count: results.length };
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
const createRecipe = (recipe, ownerId) => {
    if (!(recipe instanceof Recipe)) {
        throw new Error('Recipe payload must be a Recipe object');
    }

    const createdRecipe = {
        id: nextID(),
        ownerId,
        ...recipe,
    };

    mockRecipes.push(createdRecipe);

    return createdRecipe;
};

const findRecipeIndex = (recipeId) => mockRecipes.findIndex((item) => item.id === recipeId);

const ensureRecipeOwner = (recipe, ownerId) => {
    if (!recipe.ownerId) {
        const error = new Error('Recipe is read-only');
        error.statusCode = 403;
        throw error;
    }

    if (recipe.ownerId !== ownerId) {
        const error = new Error('You do not have permission to modify this recipe');
        error.statusCode = 403;
        throw error;
    }
};

const updateRecipe = (recipeId, updates = {}, ownerId) => {
    const recipeIndex = findRecipeIndex(recipeId);

    if (recipeIndex === -1) {
        const error = new Error('Recipe not found');
        error.statusCode = 404;
        throw error;
    }

    const existingRecipe = mockRecipes[recipeIndex];
    ensureRecipeOwner(existingRecipe, ownerId);

    if (typeof updates.name === 'string' && updates.name.trim()) {
        existingRecipe.name = updates.name.trim();
    }

    if (typeof updates.description === 'string') {
        existingRecipe.description = updates.description;
    }

    if (Array.isArray(updates.foods)) {
        existingRecipe.foods = updates.foods;
    }

    if (Array.isArray(updates.steps)) {
        existingRecipe.steps = updates.steps;
    }

    mockRecipes[recipeIndex] = existingRecipe;
    return existingRecipe;
};

const deleteRecipe = (recipeId, ownerId) => {
    const recipeIndex = findRecipeIndex(recipeId);

    if (recipeIndex === -1) {
        const error = new Error('Recipe not found');
        error.statusCode = 404;
        throw error;
    }

    const recipe = mockRecipes[recipeIndex];
    ensureRecipeOwner(recipe, ownerId);

    return mockRecipes.splice(recipeIndex, 1)[0];
};

const attachRecommendedRecipes = (req, res, next) => {
    const fridgeItems = req.appUser && Array.isArray(req.appUser.inventory) ? req.appUser.inventory : [];
    req.recommendedRecipes = getRecipeRecommendations(fridgeItems);
    next();
};


module.exports = {
    searchRecipes,
    getRecipePreview,
    getRecipeById,
    createRecipe,
    attachRecommendedRecipes,
    getRecipeRecommendations,
    getRecipesForOwner,
    updateRecipe,
    deleteRecipe,
};
