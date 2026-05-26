
const express = require('express');
// const createAuthMiddleware = require('../services/auth');
const {
	attachUser,
	getAccount,
	getGoalForDate,
	getGoalFoods,
	getFridge,
	addGoalFood,
	addFridgeItem,
	updateAccount,
	updateGoal,
} = require('../controllers/user');

const router = express.Router();

// NOTE: in production pass a real Firebase service account object here
// const auth = createAuthMiddleware('Temp');

// Protected user endpoints
router.get('/me/account', attachUser, getAccount);  //auth
router.get('/me/goal/foods', attachUser, getGoalFoods); //auth
router.get('/me/goal/:date?', attachUser, getGoalForDate); //auth
router.get('/me/goal', attachUser, getGoalForDate); //auth
router.get('/me/fridge', attachUser, getFridge); //auth

router.post('/me/goal/:date/foods', attachUser, addGoalFood); //auth
router.post('/me/goal/foods', attachUser, addGoalFood); //auth
router.post('/me/fridge', attachUser, addFridgeItem); //auth

router.put('/me/account', attachUser, updateAccount); //auth
router.put('/me/goal/:date', attachUser, updateGoal); //auth
router.put('/me/goal/date', attachUser, updateGoal); //auth

module.exports = router;
