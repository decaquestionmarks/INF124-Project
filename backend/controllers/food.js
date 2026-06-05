const mongoose = require('mongoose');
const FoodModel = require('../../models/food');

const seedFoods = [
    {
        name: 'Chicken Breast',
        classification: 'Meat',
        measurementClassification: 'Mass',
        measurement: 165,
        macronutrients: { calories: 275, fat: 3.6, protein: 51, carbs: 2 },
    },
    {
        name: 'White Rice',
        classification: 'Pantry',
        measurementClassification: 'Mass',
        measurement: 1,
        macronutrients: { calories: 205, fat: 0.4, protein: 4.3, carbs: 45 },
    },
    {
        name: 'Banana',
        classification: 'Produce',
        measurementClassification: 'Mass',
        measurement: 1,
        macronutrients: { calories: 105, fat: 0.4, protein: 1.3, carbs: 27 },
    },
    {
        name: 'Egg (Boiled)',
        classification: 'Other',
        measurementClassification: 'Mass',
        measurement: 1,
        macronutrients: { calories: 78, fat: 5.3, protein: 6.3, carbs: 0.6 },
    },
    {
        name: 'Greek Yogurt',
        classification: 'Dairy',
        measurementClassification: 'Mass',
        measurement: 150,
        macronutrients: { calories: 120, fat: 4, protein: 15, carbs: 5 },
    },
    {
        name: 'Peanut Butter',
        classification: 'Condiments',
        measurementClassification: 'Mass',
        measurement: 2,
        macronutrients: { calories: 190, fat: 16, protein: 7, carbs: 7 },
    },
    {
        name: 'Oatmeal',
        classification: 'Pantry',
        measurementClassification: 'Mass',
        measurement: 40,
        macronutrients: { calories: 150, fat: 3, protein: 5, carbs: 27 },
    },
    {
        name: 'Salmon',
        classification: 'Meat',
        measurementClassification: 'Mass',
        measurement: 100,
        macronutrients: { calories: 208, fat: 13, protein: 20, carbs: 0 },
    },
    {
        name: 'Avocado',
        classification: 'Produce',
        measurementClassification: 'Mass',
        measurement: 1,
        macronutrients: { calories: 240, fat: 22, protein: 3, carbs: 13 },
    },
    {
        name: 'Whole Wheat Bread',
        classification: 'Bakery',
        measurementClassification: 'Mass',
        measurement: 1,
        macronutrients: { calories: 80, fat: 1, protein: 4, carbs: 14 },
    },
];

const normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const toFoodObject = (food) => {
    if (typeof food.toFoodObject === 'function') {
        return food.toFoodObject();
    }

    return {
        id: food._id ? food._id.toString() : food.id,
        name: food.name,
        classification: food.classification,
        measurementClassification: food.measurementClassification,
        measurement: food.measurement,
        macronutrients: food.macronutrients || {},
    };
};

const isMongoReady = () => mongoose.connection.readyState === 1;

const ensureSeeded = async () => {
    if (!isMongoReady()) return;

    const count = await FoodModel.countDocuments();
    if (count === 0) {
        await FoodModel.insertMany(seedFoods.map((food) => FoodModel.fromInput(food)));
    }
};

const getAllFoods = async () => {
    if (isMongoReady()) {
        await ensureSeeded();
        const foods = await FoodModel.find({}).sort({ name: 1 });
        return foods.map(toFoodObject);
    }

    return seedFoods.map((food) => ({
        id: normalizeName(food.name).replace(/[^a-z0-9]+/g, '-'),
        ...food,
    }));
};

const searchFoods = async (query = '') => {
    const normalizedQuery = normalizeName(query);

    if (isMongoReady()) {
        await ensureSeeded();

        if (!normalizedQuery) {
            return getAllFoods();
        }

        const foods = await FoodModel.find({
            $or: [
                { name: { $regex: normalizedQuery, $options: 'i' } },
                { classification: { $regex: normalizedQuery, $options: 'i' } },
                { measurementClassification: { $regex: normalizedQuery, $options: 'i' } },
            ],
        }).sort({ name: 1 });

        return foods.map(toFoodObject);
    }

    if (!normalizedQuery) {
        return getAllFoods();
    }

    return seedFoods
        .filter((food) => {
            return normalizeName(food.name).includes(normalizedQuery)
                || normalizeName(food.classification).includes(normalizedQuery)
                || normalizeName(food.measurementClassification).includes(normalizedQuery);
        })
        .map((food) => ({
            id: normalizeName(food.name).replace(/[^a-z0-9]+/g, '-'),
            ...food,
        }));
};

const getFoodByIdentifier = async (identifier) => {
    const normalizedIdentifier = normalizeName(identifier);

    if (!normalizedIdentifier) {
        const error = new Error('Food identifier is required');
        error.statusCode = 400;
        throw error;
    }

    if (isMongoReady()) {
        await ensureSeeded();

        const food = await FoodModel.findOne({
            $or: [
                { name: new RegExp(`^${normalizedIdentifier}$`, 'i') },
                { _id: mongoose.isValidObjectId(normalizedIdentifier) ? normalizedIdentifier : null },
            ],
        });

        if (food) {
            return toFoodObject(food);
        }
    }

    const food = seedFoods.find((item) => {
        return normalizeName(item.name) === normalizedIdentifier
            || normalizeName(item.name).replace(/[^a-z0-9]+/g, '-') === normalizedIdentifier;
    });

    if (!food) {
        const error = new Error('Food not found');
        error.statusCode = 404;
        throw error;
    }

    return {
        id: normalizeName(food.name).replace(/[^a-z0-9]+/g, '-'),
        ...food,
    };
};

module.exports = {
    searchFoods,
    getFoodByIdentifier,
    getAllFoods,
};