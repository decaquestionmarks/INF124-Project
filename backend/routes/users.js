
const express = require('express');
// const createAuthMiddleware = require('../services/auth');
const {
	attachUser,
	getAccount,
	getGoalForDate,
	getGoalFoods,
	getFridge,
} = require('../controllers/user');

const router = express.Router();

// NOTE: in production pass a real Firebase service account object here
// const auth = createAuthMiddleware('Temp');

// Protected user endpoints
router.get('/:me/account', attachUser, getAccount);  //auth
router.get('/:me/goal', attachUser, getGoalForDate); //auth
router.get('/:me/goal/foods', attachUser, getGoalFoods); //auth
router.get('/:me/fridge', attachUser, getFridge); //auth

module.exports = router;
