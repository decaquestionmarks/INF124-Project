const Recipe = require('../../models/recipe');
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    foods: [{
        name: { type: String, required: true },
        classification: { type: String, required: true },
        measurementClassification: { type: String, required: true },
        measurement: { type: Number, required: true }
    }],
    steps: [{ type: String, required: true }],
    ownerId: { type: String, required: true }
}, {
    timestamps: true
});

const RecipeModel = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

const normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const getIngredientName = (ingredient) => normalizeName(ingredient && ingredient.name);

const toRecipeObject = (recipe) => ({
    id: recipe._id ? recipe._id.toString() : recipe.id,
    name: recipe.name,
    description: recipe.description,
    foods: Array.isArray(recipe.foods) ? recipe.foods : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    ownerId: recipe.ownerId,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
});

const getRecipeRecommendations = (fridgeItems = []) => {
    const fridgeNames = new Set(
        fridgeItems
            .map((item) => normalizeName(item && item.name))
            .filter(Boolean)
    );

    return RecipeModel.find({}).lean().then((recipes) => recipes.filter((recipe) => {
        if (!Array.isArray(recipe.foods) || recipe.foods.length === 0) {
            return false;
        }

        return recipe.foods.every((ingredient) => fridgeNames.has(getIngredientName(ingredient)));
    }).map((recipe) => ({
        id: recipe._id.toString(),
        name: recipe.name,
        description: recipe.description,
        foods: recipe.foods,
        steps: recipe.steps,
    })));
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

    const normalizedQuery = query.toString().trim().toLowerCase();
    return RecipeModel.find({
        $or: [
            { name: { $regex: normalizedQuery, $options: 'i' } },
            { description: { $regex: normalizedQuery, $options: 'i' } },
        ],
    }).lean().then((results) => ({
        query: normalizedQuery,
        results: results.map(toRecipeObject),
        count: results.length,
    }));
};

/**
 * Get a recipe preview by ID
 * @param {string} recipeId - The recipe ID
 * @returns {object} - Preview object with id, name, and image
 * @throws {Error} - If recipe not found
 */
const getRecipePreview = (recipeId) => {
    return RecipeModel.findById(recipeId).lean().then((recipe) => {
        if (!recipe) {
            throw new Error('Recipe not found');
        }

        return {
            id: recipe._id.toString(),
            name: recipe.name,
            image: recipe.foods.length > 0 ? `https://example.com/images/${recipe.foods[0].name.toLowerCase().replace(/\s+/g, '-')}.jpg` : null,
        };
    });
};

const toRecipePreview = (recipe) => ({
    id: recipe._id ? recipe._id.toString() : recipe.id,
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

    return RecipeModel.find({ ownerId }).lean()
        .then((results) => ({ results: results.map(toRecipePreview), count: results.length }));
};

/**
 * Get a full recipe by ID
 * @param {string} recipeId - The recipe ID
 * @returns {object} - Full recipe object
 * @throws {Error} - If recipe not found
 */
const getRecipeById = (recipeId) => {
    return RecipeModel.findById(recipeId).lean().then((recipe) => {
        if (!recipe) {
            throw new Error('Recipe not found');
        }

        return recipe;
    });
};

const nextID = () => {
    return new mongoose.Types.ObjectId().toString();
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

    const createdRecipe = new RecipeModel({
        ownerId,
        name: recipe.name,
        description: recipe.description,
        foods: recipe.foods,
        steps: recipe.steps,
    });

    return createdRecipe.save().then((savedRecipe) => savedRecipe.toObject());
};

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
    return RecipeModel.findById(recipeId).then((existingRecipe) => {
        if (!existingRecipe) {
            const error = new Error('Recipe not found');
            error.statusCode = 404;
            throw error;
        }

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

        return existingRecipe.save().then((savedRecipe) => savedRecipe.toObject());
    });
};

const deleteRecipe = (recipeId, ownerId) => {
    return RecipeModel.findById(recipeId).then((recipe) => {
        if (!recipe) {
            const error = new Error('Recipe not found');
            error.statusCode = 404;
            throw error;
        }

        ensureRecipeOwner(recipe, ownerId);
        return recipe.deleteOne().then(() => recipe.toObject());
    });
};

const attachRecommendedRecipes = (req, res, next) => {
    const fridgeItems = req.appUser && typeof req.appUser.getFridgeItems === 'function' ? req.appUser.getFridgeItems() : [];
    Promise.resolve(getRecipeRecommendations(fridgeItems))
        .then((recommendedRecipes) => {
            req.recommendedRecipes = recommendedRecipes;
            next();
        })
        .catch(next);
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
