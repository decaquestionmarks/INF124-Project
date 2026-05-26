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
	const date = req.query.date || new Date().toISOString().slice(0, 10);
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

	// Return goal summary and progress
	const progress = goal.calculateProgress ? goal.calculateProgress() : null;

	res.json({ date, goal: goal.goals || goal, progress });
};

// GET /users/me/goal/foods?date=YYYY-MM-DD
const getGoalFoods = (req, res) => {
	const date = req.query.date || new Date().toISOString().slice(0, 10);
	const goal = req.appUser.getGoal(date);

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });

	res.json({ date, foods: typeof goal.getFoods === 'function' ? goal.getFoods() : goal.foods || [] });
};

// GET /users/me/fridge
const getFridge = (req, res) => {
	const fridge = req.appUser.inventory || [];
	res.json({ fridge });
};

module.exports = {
	attachUser,
	getAccount,
	getGoalForDate,
	getGoalFoods,
	getFridge,
};
