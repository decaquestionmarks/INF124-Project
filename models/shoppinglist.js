const Food = require('./food');

class ShoppingList {
    constructor(id) {
        if (typeof id !== 'number') {
			throw new TypeError('id must be a number');
		}
        this.id = id;
        this.foods = [];
    }

    addFood(food) {
        if (food instanceof Food) {
            this.foods.push(food);
        } else {
            throw new Error('Item must be a Food object');
        }
    }

    removeFood(name) {
        this.foods = this.foods.filter(food => food.name !== name);
    }

    getFoods() {
        return this.foods;
    }

    clear() {
        this.foods = [];
    }
}

module.exports = ShoppingList;