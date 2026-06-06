const { goalMacros, goalMicros } = require('./modelhelpers');
const { randomUUID } = require('crypto');

const goalNutrients = [...goalMacros, ...goalMicros];
const nutrientAliases = {
	fats: 'fat',
};

const normalizeNutrient = (nutrient) => nutrientAliases[nutrient] || nutrient;

const getNutrientAmount = (food, nutrient) => {
	const normalizedNutrient = normalizeNutrient(nutrient);
	const macros = food.macronutrients || {};
	const micros = food.micronutrients || {};
	const aliasEntries = Object.entries(nutrientAliases)
		.filter(([, value]) => value === normalizedNutrient)
		.map(([key]) => key);
	const possibleKeys = [normalizedNutrient, ...aliasEntries];

	for (const key of possibleKeys) {
		const amount = macros[key] ?? micros[key];
		if (typeof amount === 'number' && Number.isFinite(amount)) {
			return amount;
		}
	}

	return 0;
};

const normalizeFood = (food) => {
	const normalizedFood = {
		...food,
		id: food.id ? String(food.id) : randomUUID(),
		macronutrients: {
			...(food.macronutrients || {}),
		},
	};

	goalNutrients.forEach((nutrient) => {
		normalizedFood.macronutrients[nutrient] = getNutrientAmount(food, nutrient);
	});

	delete normalizedFood.macronutrients.fats;
	return normalizedFood;
};

class Goal {
	constructor(goals = {}, foods = []) {
		if (goals === null || typeof goals !== 'object' || Array.isArray(goals)) {
			throw new TypeError('goals must be an object');
		}

		if (!Array.isArray(foods)) {
			throw new TypeError('foods must be an array');
		}

		this.goals = {};
		goalNutrients.forEach((nutrient) => {
			this.goals[nutrient] = 0;
		});

		this.setGoals(goals);
		this.foods = [];
		this.addFoods(foods);
	}

	setGoal(nutrient, amount) {
		const normalizedNutrient = typeof nutrient === 'string' ? normalizeNutrient(nutrient) : nutrient;

		if (typeof normalizedNutrient !== 'string' || !goalNutrients.includes(normalizedNutrient)) {
			throw new TypeError(`nutrient must be one of: ${goalNutrients.join(', ')}`);
		}

		if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
			throw new TypeError('amount must be a non-negative finite number');
		}

		this.goals[normalizedNutrient] = amount;
	}

	setGoals(goals) {
		Object.entries(goals).forEach(([nutrient, amount]) => {
			this.setGoal(nutrient, amount);
		});
	}

	addFood(food) {
		if (food === null || typeof food !== 'object') {
			throw new TypeError('food must be an object');
		}

		if (food.macronutrients !== undefined && (food.macronutrients === null || typeof food.macronutrients !== 'object' || Array.isArray(food.macronutrients))) {
			throw new TypeError('food.macronutrients must be an object');
		}

		const normalizedFood = normalizeFood(food);
		this.foods.push(normalizedFood);
	}

	addFoods(foods) {
		foods.forEach((food) => {
			this.addFood(food);
		});
	}

	getFoods(){
		return this.foods;
	}

	calculateTotals() {
		return goalNutrients.reduce((totals, nutrient) => {
			totals[nutrient] = this.foods.reduce((sum, food) => {
				const amount = getNutrientAmount(food, nutrient);
				if (typeof amount !== 'number' || !Number.isFinite(amount)) {
					return sum;
				}

				return sum + amount;
			}, 0);

			return totals;
		}, {});
	}

	calculateProgress() {
		const totals = this.calculateTotals();

		return goalNutrients.reduce((progress, nutrient) => {
			const goal = this.goals[nutrient];
			progress[nutrient] = {
				goal,
				total: totals[nutrient],
				remaining: Math.max(goal - totals[nutrient], 0),
				percent: goal > 0 ? (totals[nutrient] / goal) * 100 : 0,
			};

			return progress;
		}, {});
	}
}

module.exports = Goal;
