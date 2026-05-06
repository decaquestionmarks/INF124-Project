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

module.exports = {
    searchRecipes,
    getRecipePreview,
    getRecipeById,
};
