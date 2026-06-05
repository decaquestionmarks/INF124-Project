const User = require('../../models/user');
const Food = require('../../models/food');
const Goal = require('../../models/goal');
const Fridge = require('../../models/fridge');
const mongoose = require('mongoose');

// Simple in-memory mock user store for demo / frontend consumption
const mockUsers = {};
const isMongoReady = () => mongoose.connection.readyState === 1;

const ensureUserExists = async (uid, decodedToken = {}) => {
	if (mockUsers[uid]) return mockUsers[uid];

	let user = null;

	if (isMongoReady()) {
		try {
		user = await User.findOne({ id: uid });
		} catch (error) {
			user = null;
		}
	}

	if (!user) {
		const name = decodedToken.name || decodedToken.email || 'Demo User';
		const fridge = new Fridge(new mongoose.Types.ObjectId().toString());
		user = new User({
			name,
			id: uid,
			fridgeId: fridge.id,
			fridge: { id: fridge.id, items: [] },
			privateRecipes: [],
			shoppingLists: [],
			goals: {},
		});

		try {
			fridge.addFood(new Food({ name: 'Milk', classification: 'Dairy', measurementClassification: 'Volume', measurement: 1, macronutrients: { calories: 150, protein: 8 } }));
			fridge.addFood(new Food({ name: 'Apple', classification: 'Produce', measurementClassification: 'Pieces', measurement: 2, macronutrients: { calories: 95, fiber: 4 } }));
		} catch (error) {
			fridge.addFood({ name: 'Milk', classification: 'Dairy', measurementClassification: 'Volume', measurement: 1, macronutrients: { calories: 150, protein: 8 } });
			fridge.addFood({ name: 'Apple', classification: 'Produce', measurementClassification: 'Pieces', measurement: 2, macronutrients: { calories: 95, fiber: 4 } });
		}

		user.setFridge(fridge);

		const today = new Date().toISOString().slice(0, 10);
		const goal = new Goal({ calories: 2000, protein: 50 }, []);
		goal.addFood({ name: 'Greek Yogurt', measurement: 100.0, measurementClassification: 'Mass', macronutrients: { calories: 120, protein: 12 } });
		goal.addFood({ name: 'Granola Bar', measurement: 100.0, measurementClassification: 'Mass', macronutrients: { calories: 180, protein: 3 } });
		user.setGoal(today, goal);

		if (isMongoReady()) {
			try {
				await user.save();
			} catch (error) {
				// Keep the in-memory document if MongoDB is unavailable.
			}
		}
	}

	mockUsers[uid] = user;
	return user;
};

// Middleware: attach application user object (from mock store) to request
const attachUser = async (req, res, next) => {
	const decoded = req.user || {};
	const uid = decoded.uid || decoded.sub || decoded.user_id || String(decoded.email || 'anonymous');

	if (!uid) return res.status(401).json({ error: 'Unauthorized' });

	try {
		req.appUser = await ensureUserExists(uid, decoded);
		return next();
	} catch (err) {
		return res.status(500).json({ error: 'Unable to load user' });
	}
};

const normalizeGoalDate = (req) => req.params.date || req.query.date || new Date().toISOString().slice(0, 10);

const buildFoodFromBody = (body = {}) => {
	const { name, classification, measurementClassification, measurement, macronutrients = {} } = body;
	return new Food({ name, classification, measurementClassification, measurement: Number(measurement), macronutrients });
};

// GET /users/me/account
const getAccount = (req, res) => {
	const u = req.appUser;
	if (!u) return res.status(404).json({ error: 'User not found' });

	// Prefer fields from auth token when available
	const account = {
		id: u.id,
		name: u.name,
	};

	if (req.user && req.user.email) account.email = req.user.email;
	res.json({ account });
};

// GET /users/me/goal?date=YYYY-MM-DD
const getGoalForDate = (req, res) => {
	const date = req.query.date || req.params.date || new Date().toISOString().slice(0, 10);
	let goal = req.appUser.getGoal(date);

	if (!goal) goal = { date, goals: {} }; // Return empty goal if not found for date

	// Return goal summary and progress
	const progress = goal.calculateProgress ? goal.calculateProgress() : null;

	res.json({ date, goal: goal.goals || goal, progress });
};

// GET /users/me/goal/foods?date=YYYY-MM-DD
const getGoalFoods = (req, res) => {
	const date = req.query.date || req.params.date || new Date().toISOString().slice(0, 10);
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

	res.json({ date, foods: typeof goal.getFoods === 'function' ? goal.getFoods() : goal.foods || [] });
};

// GET /users/me/fridge
const getFridge = (req, res) => {
	const fridge = req.appUser.getFridgeItems();
	res.json({ fridge });
};

const addGoalFood = async (req, res) => {
	const date = normalizeGoalDate(req);
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

	try {
		const food = req.body && req.body.name ? req.body : null;
		if (!food) return res.status(400).json({ error: 'Food payload is required' });

		if (typeof goal.addFood === 'function') {
			goal.addFood(food);
		} else {
			goal.foods = Array.isArray(goal.foods) ? goal.foods : [];
			goal.foods.push(food);
		}

		if (isMongoReady()) {
			req.appUser.markModified('goals');
			await req.appUser.save().catch(() => {});
		}
		return res.status(201).json({ date, foods: typeof goal.getFoods === 'function' ? goal.getFoods() : goal.foods || [] });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const addFridgeItem = async (req, res) => {
	try {
		const food = buildFoodFromBody(req.body);
		req.appUser.addFood(food);
		if (isMongoReady()) {
			await req.appUser.save().catch(() => {});
		}
		return res.status(201).json({ fridge: req.appUser.getFridgeItems() });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateAccount = async (req, res) => {
	try {
		if (typeof req.body?.name === 'string' && req.body.name.trim()) {
			req.appUser.name = req.body.name.trim();
		}

		if (isMongoReady()) {
			await req.appUser.save().catch(() => {});
		}
		return res.json({ account: { id: req.appUser.id, name: req.appUser.name, email: req.user?.email } });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateGoal = async (req, res) => {
	const date = normalizeGoalDate(req);
	const existingGoal = req.appUser.getGoal(date);

	try {
		const nextGoal = existingGoal && typeof existingGoal.setGoals === 'function'
			? existingGoal
			: new Goal(existingGoal?.goals || {}, existingGoal?.foods || []);

		if (req.body?.goals && typeof req.body.goals === 'object' && !Array.isArray(req.body.goals)) {
			if (typeof nextGoal.setGoals === 'function') {
				nextGoal.setGoals(req.body.goals);
			} else {
				nextGoal.goals = { ...req.body.goals };
			}
		}

		if (Array.isArray(req.body?.foods)) {
			if (typeof nextGoal.addFood === 'function') {
				req.body.foods.forEach((food) => nextGoal.addFood(food));
			} else {
				nextGoal.foods = Array.isArray(nextGoal.foods) ? nextGoal.foods : [];
				nextGoal.foods.push(...req.body.foods);
			}
		}

		req.appUser.setGoal(date, nextGoal);
		if (isMongoReady()) {
			req.appUser.markModified('goals');
			await req.appUser.save().catch(() => {});
		}
		return res.json({ date, goal: nextGoal.goals || nextGoal });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const deleteGoalFood = async (req, res) => {
	const date = normalizeGoalDate(req);
	const foodName = req.params.food;
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });
	if (!foodName) return res.status(400).json({ error: 'Food name is required' });

	try {
		const foods = Array.isArray(goal.foods) ? goal.foods : typeof goal.getFoods === 'function' ? goal.getFoods() : [];
		const initialCount = foods.length;
		const updatedFoods = foods.filter((food) => 
			(food && food.name && food.name.trim().toLowerCase()) !== foodName.trim().toLowerCase()
		);

		if (typeof goal.foods !== 'undefined') {
			goal.foods = updatedFoods;
		} else if (typeof goal.setFoods === 'function') {
			goal.setFoods(updatedFoods);
		}

		const removed = updatedFoods.length < initialCount;
		if (!removed) {
			return res.status(404).json({ error: 'Food not found in goal' });
		}
		if (isMongoReady()) {
			req.appUser.markModified('goals');
			await req.appUser.save().catch(() => {});
		}
		return res.json({ date, foods: updatedFoods, progress: typeof goal.calculateProgress === 'function' ? goal.calculateProgress() : null});
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const deleteFridgeFood = async (req, res) => {
	const foodName = req.params.food;

	if (!foodName) return res.status(400).json({ error: 'Food name is required' });

	try {
		const removed = req.appUser.removeFood(foodName);
		if (!removed) return res.status(404).json({ error: 'Food not found in fridge' });
		if (isMongoReady()) {
			await req.appUser.save().catch(() => {});
		}
		return res.json({ fridge: req.appUser.getFridgeItems() });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

module.exports = {
	attachUser,
	getAccount,
	getGoalForDate,
	getGoalFoods,
	getFridge,
	addGoalFood,
	addFridgeItem,
	updateAccount,
	updateGoal,
	deleteGoalFood,
	deleteFridgeFood,
};
