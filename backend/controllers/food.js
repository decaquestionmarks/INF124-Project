const mongoose = require('mongoose');
const FoodModel = require('../../models/food');
const { normalizeMeasurementClassification } = require('../../models/modelhelpers');

const seedFoods = [
    {
        name: 'Chicken Breast',
        classification: 'Meat',
        measurementClassification: 'grams',
        measurement: 165,
        macronutrients: { calories: 275, fat: 3.6, protein: 51, carbs: 2 },
    },
    {
        name: 'White Rice',
        classification: 'Pantry',
        measurementClassification: 'grams',
        measurement: 158,
        macronutrients: { calories: 205, fat: 0.4, protein: 4.3, carbs: 45 },
    },
    {
        name: 'Banana',
        classification: 'Produce',
        measurementClassification: 'grams',
        measurement: 118,
        macronutrients: { calories: 105, fat: 0.4, protein: 1.3, carbs: 27 },
    },
    {
        name: 'Egg (Boiled)',
        classification: 'Other',
        measurementClassification: 'grams',
        measurement: 50,
        macronutrients: { calories: 78, fat: 5.3, protein: 6.3, carbs: 0.6 },
    },
    {
        name: 'Greek Yogurt',
        classification: 'Dairy',
        measurementClassification: 'grams',
        measurement: 150,
        macronutrients: { calories: 120, fat: 4, protein: 15, carbs: 5 },
    },
    {
        name: 'Peanut Butter',
        classification: 'Condiments',
        measurementClassification: 'grams',
        measurement: 32,
        macronutrients: { calories: 190, fat: 16, protein: 7, carbs: 7 },
    },
    {
        name: 'Oatmeal',
        classification: 'Pantry',
        measurementClassification: 'grams',
        measurement: 40,
        macronutrients: { calories: 150, fat: 3, protein: 5, carbs: 27 },
    },
    {
        name: 'Salmon',
        classification: 'Meat',
        measurementClassification: 'grams',
        measurement: 100,
        macronutrients: { calories: 208, fat: 13, protein: 20, carbs: 0 },
    },
    {
        name: 'Avocado',
        classification: 'Produce',
        measurementClassification: 'grams',
        measurement: 150,
        macronutrients: { calories: 240, fat: 22, protein: 3, carbs: 13 },
    },
    {
        name: 'Whole Wheat Bread',
        classification: 'Bakery',
        measurementClassification: 'grams',
        measurement: 38,
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
        measurementClassification: normalizeMeasurementClassification(food.measurementClassification),
        measurement: food.measurement,
        macronutrients: food.macronutrients || {},
    };
};

const getMeasurementSearchTerms = (query) => {
    const normalizedMeasurement = normalizeMeasurementClassification(query);

    if (normalizedMeasurement === 'grams') {
        return ['grams', 'gram', 'mass', 'g'];
    }

    if (normalizedMeasurement === 'ml') {
        return ['ml', 'milliliter', 'milliliters', 'volume'];
    }

    return [query];
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
        const foods = await FoodModel.find({}).lean().sort({ name: 1 });
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

        const measurementTerms = getMeasurementSearchTerms(normalizedQuery);
        const foods = await FoodModel.find({
            $or: [
                { name: { $regex: normalizedQuery, $options: 'i' } },
                { classification: { $regex: normalizedQuery, $options: 'i' } },
                ...measurementTerms.map((term) => ({ measurementClassification: { $regex: term, $options: 'i' } })),
            ],
        }).lean().sort({ name: 1 });

        return foods.map(toFoodObject);
    }

    if (!normalizedQuery) {
        return getAllFoods();
    }

    return seedFoods
        .filter((food) => {
            return normalizeName(food.name).includes(normalizedQuery)
                || normalizeName(food.classification).includes(normalizedQuery)
                || getMeasurementSearchTerms(normalizedQuery).some((term) => normalizeName(food.measurementClassification).includes(term));
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
        }).lean();

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

const createFood = async (req, res) => {
    if (!isMongoReady()) {
        return res.status(503).json({ error: 'Database unavailable' });
    }

    try {
        const food = FoodModel.fromInput(req.body || {});
        await food.save();
        return res.status(201).json(toFoodObject(food));
    } catch (err) {
        return res.status(err.statusCode || 400).json({ error: err.message || 'Unable to create food' });
    }
};

module.exports = {
    searchFoods,
    getFoodByIdentifier,
    getAllFoods,
    createFood,
};
