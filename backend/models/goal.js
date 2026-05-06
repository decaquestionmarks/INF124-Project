const { goalMacros, goalMicros } = require('./modelhelpers');

const goalNutrients = [...goalMacros, ...goalMicros];

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
		if (typeof nutrient !== 'string' || !goalNutrients.includes(nutrient)) {
			throw new TypeError(`nutrient must be one of: ${goalNutrients.join(', ')}`);
		}

		if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
			throw new TypeError('amount must be a non-negative finite number');
		}

		this.goals[nutrient] = amount;
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

		if (food.macronutrients === null || typeof food.macronutrients !== 'object' || Array.isArray(food.macronutrients)) {
			throw new TypeError('food.macronutrients must be an object');
		}

		this.foods.push(food);
	}

	addFoods(foods) {
		foods.forEach((food) => {
			this.addFood(food);
		});
	}

	calculateTotals() {
		return goalNutrients.reduce((totals, nutrient) => {
			totals[nutrient] = this.foods.reduce((sum, food) => {
				const amount = food.macronutrients[nutrient] ?? food.micronutrients?.[nutrient] ?? 0;
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
