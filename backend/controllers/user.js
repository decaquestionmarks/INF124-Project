const User = require('../../models/user');
const Food = require('../../models/food');
const Goal = require('../../models/goal');
const Fridge = require('../../models/fridge');
const mongoose = require('mongoose');
const { broadcastGoalUpdate } = require('../services/realtime');

// Simple in-memory mock user store for demo / frontend consumption
const mockUsers = {};
const isMongoReady = () => mongoose.connection.readyState === 1;
const DEFAULT_DAILY_GOALS = { calories: 2000, protein: 50 };
const SELF_MEMBER_ID = 'self';

const normalizeFamilyMemberName = (name) => (typeof name === 'string' ? name.trim() : '');

const normalizeMemberId = (req) => {
	const memberId = req.params.memberId || req.query.memberId || req.body?.memberId;
	return typeof memberId === 'string' && memberId.trim() ? memberId.trim() : SELF_MEMBER_ID;
};

const normalizeFamilyMember = (member, user, index = 0) => {
	if (!member || typeof member !== 'object') return null;

	const rawId = typeof member.id === 'string' || typeof member.id === 'number'
		? String(member.id).trim()
		: '';
	const id = rawId || (index === 0 && member.isDefault ? SELF_MEMBER_ID : '');
	if (!id) return null;

	const fallbackName = id === SELF_MEMBER_ID ? user.name || 'Me' : 'Family member';
	const name = normalizeFamilyMemberName(member.name) || fallbackName;

	return {
		id,
		name,
		isDefault: id === SELF_MEMBER_ID || Boolean(member.isDefault),
	};
};

const ensureFamilyMembers = (user) => {
	const sourceMembers = Array.isArray(user.familyMembers) ? user.familyMembers : [];
	const members = sourceMembers
		.map((member, index) => normalizeFamilyMember(member, user, index))
		.filter(Boolean);

	const selfIndex = members.findIndex((member) => member.id === SELF_MEMBER_ID);
	const selfMember = {
		id: SELF_MEMBER_ID,
		name: user.name || 'Me',
		isDefault: true,
	};

	if (selfIndex === -1) {
		members.unshift(selfMember);
	} else {
		members[selfIndex] = {
			...members[selfIndex],
			isDefault: true,
			name: members[selfIndex].name || selfMember.name,
		};
	}

	user.familyMembers = members;
	if (typeof user.markModified === 'function') {
		user.markModified('familyMembers');
	}

	return members;
};

const getFamilyMember = (user, memberId = SELF_MEMBER_ID) => {
	const members = ensureFamilyMembers(user);
	return members.find((member) => member.id === memberId) || null;
};

const getFamilyMemberForRequest = (req, res) => {
	const memberId = normalizeMemberId(req);
	const member = getFamilyMember(req.appUser, memberId);

	if (!member) {
		res.status(404).json({ error: 'Family member not found' });
		return null;
	}

	return member;
};

const getGoalKey = (date, memberId = SELF_MEMBER_ID) => {
	const normalizedDate = date instanceof Date ? date.toISOString().slice(0, 10) : String(date || '').trim();
	return memberId === SELF_MEMBER_ID ? normalizedDate : `${memberId}:${normalizedDate}`;
};

const getStoredGoal = (user, date, memberId = SELF_MEMBER_ID) => {
	const goals = user.goals && typeof user.goals === 'object' ? user.goals : {};
	return goals[getGoalKey(date, memberId)];
};

const setStoredGoal = (user, date, memberId, goal) => {
	if (!user.goals || typeof user.goals !== 'object') {
		user.goals = {};
	}

	user.goals[getGoalKey(date, memberId)] = goal;
	if (typeof user.markModified === 'function') {
		user.markModified('goals');
	}
};

const normalizeGoalValues = (goals = {}) => {
	return Object.entries(goals || {}).reduce((normalized, [nutrient, amount]) => {
		const numericAmount = Number(amount);
		if (Number.isFinite(numericAmount) && numericAmount >= 0) {
			normalized[nutrient] = numericAmount;
		}

		return normalized;
	}, {});
};

const createDefaultGoal = () => new Goal(DEFAULT_DAILY_GOALS, []);

const toGoalInstance = (goal) => {
	if (!goal) {
		return createDefaultGoal();
	}

	if (typeof goal.calculateProgress === 'function' && typeof goal.getFoods === 'function') {
		const foods = goal.getFoods();
		if (Array.isArray(foods) && foods.every((food) => food && food.id)) {
			return goal;
		}

		return new Goal(
			{ ...DEFAULT_DAILY_GOALS, ...normalizeGoalValues(goal.goals || {}) },
			Array.isArray(foods) ? foods : []
		);
	}

	return new Goal(
		{ ...DEFAULT_DAILY_GOALS, ...normalizeGoalValues(goal.goals || {}) },
		Array.isArray(goal.foods) ? goal.foods : []
	);
};

const ensureGoalForDate = (user, date, memberId = SELF_MEMBER_ID) => {
	const existingGoal = getStoredGoal(user, date, memberId);
	const goal = toGoalInstance(existingGoal);

	if (!existingGoal || existingGoal !== goal) {
		setStoredGoal(user, date, memberId, goal);
	}

	return goal;
};

const saveUser = async (user, modifiedPath) => {
	if (!isMongoReady()) return;

	if (modifiedPath && typeof user.markModified === 'function') {
		user.markModified(modifiedPath);
	}

	await user.save().catch(() => {});
};

const getGoalFoodsFromGoal = (goal) => typeof goal.getFoods === 'function' ? goal.getFoods() : goal.foods || [];

const buildGoalPayload = (date, goal, member) => ({
	date,
	memberId: member?.id || SELF_MEMBER_ID,
	member,
	goal: goal.goals || {},
	foods: getGoalFoodsFromGoal(goal),
	progress: typeof goal.calculateProgress === 'function' ? goal.calculateProgress() : null,
});

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
			familyMembers: [{ id: SELF_MEMBER_ID, name, isDefault: true }],
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
		const goal = createDefaultGoal();
		goal.addFood({ name: 'Greek Yogurt', measurement: 100.0, measurementClassification: 'Mass', macronutrients: { calories: 120, protein: 12 } });
		goal.addFood({ name: 'Granola Bar', measurement: 100.0, measurementClassification: 'Mass', macronutrients: { calories: 180, protein: 3 } });
		user.setGoal(today, goal);

		try {
			await saveUser(user);
		} catch (error) {
			// Keep the in-memory document if MongoDB is unavailable.
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

// GET /users/me/family
const getFamily = (req, res) => {
	const members = ensureFamilyMembers(req.appUser);

	saveUser(req.appUser, 'familyMembers').finally(() => {
		res.json({ members });
	});
};

// POST /users/me/family
const addFamilyMember = async (req, res) => {
	const name = normalizeFamilyMemberName(req.body?.name);

	if (!name) {
		return res.status(400).json({ error: 'Family member name is required' });
	}

	const members = ensureFamilyMembers(req.appUser);
	const hasDuplicateName = members.some((member) => member.name.toLowerCase() === name.toLowerCase());

	if (hasDuplicateName) {
		return res.status(409).json({ error: 'A family member with that name already exists' });
	}

	const member = {
		id: new mongoose.Types.ObjectId().toString(),
		name,
		isDefault: false,
	};

	req.appUser.familyMembers = [...members, member];

	try {
		await saveUser(req.appUser, 'familyMembers');
		return res.status(201).json({ member, members: req.appUser.familyMembers });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

// DELETE /users/me/family/:memberId
const deleteFamilyMember = async (req, res) => {
	const memberId = normalizeMemberId(req);

	if (memberId === SELF_MEMBER_ID) {
		return res.status(400).json({ error: 'The account owner profile cannot be removed' });
	}

	const members = ensureFamilyMembers(req.appUser);
	const nextMembers = members.filter((member) => member.id !== memberId);

	if (nextMembers.length === members.length) {
		return res.status(404).json({ error: 'Family member not found' });
	}

	req.appUser.familyMembers = nextMembers;

	if (req.appUser.goals && typeof req.appUser.goals === 'object') {
		const memberGoalPrefix = `${memberId}:`;
		Object.keys(req.appUser.goals).forEach((goalKey) => {
			if (goalKey.startsWith(memberGoalPrefix)) {
				delete req.appUser.goals[goalKey];
			}
		});
		req.appUser.markModified?.('goals');
	}

	try {
		await saveUser(req.appUser, 'familyMembers');
		return res.json({ members: nextMembers });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

// GET /users/me/goal?date=YYYY-MM-DD
const getGoalForDate = (req, res) => {
	const member = getFamilyMemberForRequest(req, res);
	if (!member) return;

	const date = normalizeGoalDate(req);
	const goal = ensureGoalForDate(req.appUser, date, member.id);

	saveUser(req.appUser, 'goals').finally(() => {
		res.json(buildGoalPayload(date, goal, member));
	});
};

// GET /users/me/goal/foods?date=YYYY-MM-DD
const getGoalFoods = (req, res) => {
	const member = getFamilyMemberForRequest(req, res);
	if (!member) return;

	const date = normalizeGoalDate(req);
	const goal = ensureGoalForDate(req.appUser, date, member.id);

	saveUser(req.appUser, 'goals').finally(() => {
		res.json({ date, memberId: member.id, foods: getGoalFoodsFromGoal(goal) });
	});
};

// GET /users/me/fridge
const getFridge = (req, res) => {
	const fridge = req.appUser.getFridgeItems();
	res.json({ fridge });
};

const addGoalFood = async (req, res) => {
	const member = getFamilyMemberForRequest(req, res);
	if (!member) return;

	const date = normalizeGoalDate(req);
	const goal = ensureGoalForDate(req.appUser, date, member.id);

	try {
		const food = req.body && req.body.name ? { ...req.body } : null;
		if (!food) return res.status(400).json({ error: 'Food payload is required' });
		delete food.id;
		delete food.memberId;
		delete food.date;

		if (typeof goal.addFood === 'function') {
			goal.addFood(food);
		} else {
			goal.foods = Array.isArray(goal.foods) ? goal.foods : [];
			goal.foods.push(food);
		}

		await saveUser(req.appUser, 'goals');
		const payload = buildGoalPayload(date, goal, member);
		broadcastGoalUpdate(req.appUser.id, date, member.id, payload);
		return res.status(201).json(payload);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const addFridgeItem = async (req, res) => {
	try {
		const food = buildFoodFromBody(req.body);
		req.appUser.addFood(food);
		await saveUser(req.appUser);
		return res.status(201).json({ fridge: req.appUser.getFridgeItems() });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateAccount = async (req, res) => {
	try {
		if (typeof req.body?.name === 'string' && req.body.name.trim()) {
			req.appUser.name = req.body.name.trim();
			const members = ensureFamilyMembers(req.appUser);
			const selfMember = members.find((member) => member.id === SELF_MEMBER_ID);
			if (selfMember) {
				selfMember.name = req.appUser.name;
				req.appUser.familyMembers = members;
				req.appUser.markModified?.('familyMembers');
			}
		}

		await saveUser(req.appUser);
		return res.json({ account: { id: req.appUser.id, name: req.appUser.name, email: req.user?.email } });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const updateGoal = async (req, res) => {
	const member = getFamilyMemberForRequest(req, res);
	if (!member) return;

	const date = normalizeGoalDate(req);

	try {
		const nextGoal = ensureGoalForDate(req.appUser, date, member.id);

		if (req.body?.goals && typeof req.body.goals === 'object' && !Array.isArray(req.body.goals)) {
			if (typeof nextGoal.setGoals === 'function') {
				nextGoal.setGoals(normalizeGoalValues(req.body.goals));
			} else {
				nextGoal.goals = normalizeGoalValues(req.body.goals);
			}
		}

		if (Array.isArray(req.body?.foods)) {
			nextGoal.foods = [];
			if (typeof nextGoal.addFood === 'function') {
				req.body.foods.forEach((food) => nextGoal.addFood(food));
			} else {
				nextGoal.foods.push(...req.body.foods);
			}
		}

		setStoredGoal(req.appUser, date, member.id, nextGoal);
		await saveUser(req.appUser, 'goals');
		const payload = buildGoalPayload(date, nextGoal, member);
		broadcastGoalUpdate(req.appUser.id, date, member.id, payload);
		return res.json(payload);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const deleteGoalFood = async (req, res) => {
	const member = getFamilyMemberForRequest(req, res);
	if (!member) return;

	const date = normalizeGoalDate(req);
	const foodId = req.params.food;
	const existingGoal = getStoredGoal(req.appUser, date, member.id);
	const goal = existingGoal ? ensureGoalForDate(req.appUser, date, member.id) : null;

	if (!goal) return res.status(404).json({ error: 'Goal not found for date' });
	if (!foodId) return res.status(400).json({ error: 'Food ID is required' });

	try {
		const foods = getGoalFoodsFromGoal(goal);
		const initialCount = foods.length;
		const updatedFoods = foods.filter((food) => String(food && food.id) !== String(foodId));

		if (typeof goal.foods !== 'undefined') {
			goal.foods = updatedFoods;
		} else if (typeof goal.setFoods === 'function') {
			goal.setFoods(updatedFoods);
		}

		const removed = updatedFoods.length < initialCount;
		if (!removed) {
			return res.status(404).json({ error: 'Food not found in goal' });
		}
		setStoredGoal(req.appUser, date, member.id, goal);
		await saveUser(req.appUser, 'goals');
		const payload = buildGoalPayload(date, goal, member);
		broadcastGoalUpdate(req.appUser.id, date, member.id, payload);
		return res.json(payload);
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
		await saveUser(req.appUser);
		return res.json({ fridge: req.appUser.getFridgeItems() });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

module.exports = {
	attachUser,
	getAccount,
	getFamily,
	getGoalForDate,
	getGoalFoods,
	getFridge,
	addFamilyMember,
	addGoalFood,
	addFridgeItem,
	updateAccount,
	updateGoal,
	deleteFamilyMember,
	deleteGoalFood,
	deleteFridgeFood,
};
