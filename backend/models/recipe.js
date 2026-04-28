const Food = require('./food');

class Recipe {
    constructor(name, description, foods, steps) {
        // Validate name
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Name is required and must be a non-empty string');
        }

        // Validate description
        if (typeof description !== 'string') {
            throw new Error('Description must be a string');
        }

        // Validate foods
        if (!Array.isArray(foods)) {
            throw new Error('Foods must be an array');
        }

        // Validate steps
        if (!Array.isArray(steps)) {
            throw new Error('Steps must be an array');
        }

        this.name = name.trim();
        this.description = description;
        this.foods = foods;
        this.steps = steps;
    }
}

module.exports = Recipe;