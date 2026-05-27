const Food = require('./food');

class Recipe {
    constructor(name, description, foods, steps) {
        // Validate ID
        // had to comment out since creating recipe object first then adding id after
        // if (!id || typeof id !== 'string') {
        //     throw new Error('ID is required and must be a string');
        // }

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
        
        // commented out for same reason as above
        // this.id = id;
        this.name = name.trim();
        this.description = description;
        this.foods = foods;
        this.steps = steps;
    }
}

module.exports = Recipe;