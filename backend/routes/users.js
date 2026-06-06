
const express = require('express');
const { requireAuth } = require('../services/auth');
const {
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
} = require('../controllers/user');

const router = express.Router();

router.use('/me', requireAuth, attachUser);

// Protected user endpoints
router.get('/me/account', getAccount);
router.get('/me/family', getFamily);
router.get('/me/goal/foods', getGoalFoods);
router.get('/me/goal/:date?', getGoalForDate);
router.get('/me/goal', getGoalForDate);
router.get('/me/fridge', getFridge);

router.post('/me/family', addFamilyMember);
router.post('/me/goal/:date/foods', addGoalFood);
router.post('/me/goal/foods', addGoalFood);
router.post('/me/fridge', addFridgeItem);

router.put('/me/account', updateAccount);
router.put('/me/goal/:date', updateGoal);
router.put('/me/goal/', updateGoal);

router.delete('/me/family/:memberId', deleteFamilyMember);
router.delete('/me/goal/:date/:food', deleteGoalFood);
router.delete('/me/goal/:food', deleteGoalFood);
router.delete('/me/fridge/:food', deleteFridgeFood);

module.exports = router;
