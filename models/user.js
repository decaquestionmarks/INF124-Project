const Food = require('./food');
const Recipe = require('./recipe');
const ShoppingList = require('./shoppinglist');
const Goal = require('./goal');

class User {
	constructor(name, id) {
		if (typeof name !== 'string' || !name.trim()) {
			throw new TypeError('name must be a non-empty string');
		}

		if (typeof id !== 'string' && typeof id !== 'number') {
			throw new TypeError('id must be a string or number');
		}

		this.name = name.trim();
		this.id = id;
		this.inventory = [];
		this.privateRecipes = [];
		this.shoppingLists = [];
		this.goals = {};
	}

	addFood(food) {
		if (!(food instanceof Food)) {
			throw new TypeError('food must be a Food object');
		}

		this.inventory.push(food);
	}

	removeFood(name) {
		this.inventory = this.inventory.filter((food) => food.name !== name);
	}

	addPrivateRecipe(recipe) {
		if (!(recipe instanceof Recipe)) {
			throw new TypeError('recipe must be a Recipe object');
		}

		this.privateRecipes.push(recipe);
	}

	addShoppingList(shoppingList) {
		if (!(shoppingList instanceof ShoppingList)) {
			throw new TypeError('shoppingList must be a ShoppingList object');
		}

		this.shoppingLists.push(shoppingList);
	}

	setGoal(date, goal) {
		const goalDate = date instanceof Date ? date.toISOString().slice(0, 10) : date;

		if (typeof goalDate !== 'string' || !goalDate.trim()) {
			throw new TypeError('date must be a non-empty string or Date');
		}

		if (!(goal instanceof Goal)) {
			throw new TypeError('goal must be a Goal object');
		}

		this.goals[goalDate.trim()] = goal;
	}

	getGoal(date) {
		const goalDate = date instanceof Date ? date.toISOString().slice(0, 10) : date;

		if (typeof goalDate !== 'string' || !goalDate.trim()) {
			throw new TypeError('date must be a non-empty string or Date');
		}

		return this.goals[goalDate.trim()];
	}
}

module.exports = User;
