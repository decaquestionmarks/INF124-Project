const User = require('../../models/user');
const Food = require('../../models/food');
const Goal = require('../../models/goal');

// Simple in-memory mock user store for demo / frontend consumption
const mockUsers = {};

const ensureUserExists = (uid, decodedToken = {}) => {
	if (mockUsers[uid]) return mockUsers[uid];

	const name = decodedToken.name || decodedToken.email || 'Demo User';
	const user = new User(name, uid);

	// Add some fridge items (Food instances)
	try {
		user.addFood(new Food('Milk', 'Dairy', 'Volume', 1, { calories: 150, protein: 8 }));
		user.addFood(new Food('Apple', 'Produce', 'Pieces', 2, { calories: 95, fiber: 4 }));
	} catch (e) {
		// If model validation fails, fall back to plain objects
		user.inventory.push({ name: 'Milk', measurementClassification: 'Volume', measurement: 1 });
		user.inventory.push({ name: 'Apple', measurementClassification: 'Pieces', measurement: 2 });
	}

	// Create a goal for today with a couple tracked foods
	const today = new Date().toISOString().slice(0, 10);
	const goal = new Goal({ calories: 2000, protein: 50 }, []);

	goal.addFood({ name: 'Greek Yogurt', macronutrients: { calories: 120, protein: 12 } });
	goal.addFood({ name: 'Granola Bar', macronutrients: { calories: 180, protein: 3 } });

	user.setGoal(today, goal);

	mockUsers[uid] = user;
	return user;
};

// Middleware: attach application user object (from mock store) to request
const attachUser = (req, res, next) => {
	const decoded = req.user || {};
	const uid = decoded.uid || decoded.sub || decoded.user_id || String(decoded.email || 'anonymous');

	if (!uid) return res.status(401).json({ error: 'Unauthorized' });

	try {
		req.appUser = ensureUserExists(uid, decoded);
		return next();
	} catch (err) {
		return res.status(500).json({ error: 'Unable to load user' });
	}
};

const normalizeGoalDate = (req) => req.params.date || req.query.date || new Date().toISOString().slice(0, 10);

const buildFoodFromBody = (body = {}) => {
	const { name, classification, measurementClassification, measurement, macronutrients = {} } = body;
	return new Food(name, classification, measurementClassification, Number(measurement), macronutrients);
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
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

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
	const fridge = req.appUser.inventory || [];
	res.json({ fridge });
};

const addGoalFood = (req, res) => {
	const date = normalizeGoalDate(req);
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

	try {
		const food = req.body && req.body.name ? req.body : null;
		if (!food) return res.status(400).json({ error: 'Food payload is required' });

		goal.addFood(food);
		return res.status(201).json({ date, foods: goal.getFoods() });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const addFridgeItem = (req, res) => {
	try {
		const food = buildFoodFromBody(req.body);
		req.appUser.addFood(food);
		return res.status(201).json({ fridge: req.appUser.inventory });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateAccount = (req, res) => {
	try {
		if (typeof req.body?.name === 'string' && req.body.name.trim()) {
			req.appUser.name = req.body.name.trim();
		}

		return res.json({ account: { id: req.appUser.id, name: req.appUser.name, email: req.user?.email } });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateGoal = (req, res) => {
	const date = normalizeGoalDate(req);
	const existingGoal = req.appUser.getGoal(date);

	try {
		const nextGoal = existingGoal || new Goal({}, []);

		if (req.body?.goals && typeof req.body.goals === 'object' && !Array.isArray(req.body.goals)) {
			nextGoal.setGoals(req.body.goals);
		}

		if (Array.isArray(req.body?.foods)) {
			req.body.foods.forEach((food) => nextGoal.addFood(food));
		}

		req.appUser.setGoal(date, nextGoal);
		return res.json({ date, goal: nextGoal.goals || nextGoal, progress: nextGoal.calculateProgress() });
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
};
