const mongoose = require('../backend/node_modules/mongoose');
const Food = require('./food');
const Recipe = require('./recipe');
const ShoppingList = require('./shoppinglist');
const Goal = require('./goal');
const { normalizeMeasurementClassification } = require('./modelhelpers');

const fridgeItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        classification: { type: String, trim: true },
        measurementClassification: { type: String, required: true, trim: true, set: normalizeMeasurementClassification },
        measurement: { type: Number, required: true },
        macronutrients: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { _id: false }
);

const savedFoodSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        classification: { type: String, trim: true, default: 'Other' },
        measurementClassification: { type: String, required: true, trim: true, set: normalizeMeasurementClassification },
        measurement: { type: Number, required: true },
        macronutrients: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { _id: false }
);

const fridgeSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        items: { type: [fridgeItemSchema], default: [] },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        id: { type: String, required: true, unique: true, index: true },
        fridgeId: { type: String, default: null },
        fridge: { type: fridgeSchema, default: null },
        privateRecipes: { type: [mongoose.Schema.Types.Mixed], default: [] },
        shoppingLists: { type: [mongoose.Schema.Types.Mixed], default: [] },
        familyMembers: { type: [mongoose.Schema.Types.Mixed], default: [] },
        savedFoods: { type: [savedFoodSchema], default: [] },
        goals: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

const normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const normalizeDate = (date) => (date instanceof Date ? date.toISOString().slice(0, 10) : date);

const toPlainFood = (food, options = {}) => {
    if (!food) return null;
    const { includeId = false } = options;

    if (typeof food.toObject === 'function') {
        const object = food.toObject();
        const plainFood = {
            name: object.name,
            classification: object.classification,
            measurementClassification: normalizeMeasurementClassification(object.measurementClassification),
            measurement: object.measurement,
            macronutrients: object.macronutrients || {},
        };

        if (includeId && object.id) {
            plainFood.id = String(object.id);
        }

        return plainFood;
    }

    const plainFood = {
        name: food.name,
        classification: food.classification,
        measurementClassification: normalizeMeasurementClassification(food.measurementClassification),
        measurement: food.measurement,
        macronutrients: food.macronutrients || {},
    };

    if (includeId && food.id) {
        plainFood.id = String(food.id);
    }

    return plainFood;
};

userSchema.methods.setFridge = function setFridge(fridge) {
    if (!fridge || typeof fridge !== 'object') {
        throw new TypeError('fridge must be a Fridge object or plain object');
    }

    const fridgeId = typeof fridge.id === 'string' || typeof fridge.id === 'number'
        ? String(fridge.id)
        : new mongoose.Types.ObjectId().toString();

    const items = typeof fridge.getItems === 'function'
        ? fridge.getItems().map(toPlainFood).filter(Boolean)
        : Array.isArray(fridge.items)
            ? fridge.items.map(toPlainFood).filter(Boolean)
            : [];

    this.fridgeId = fridgeId;
    this.fridge = { id: fridgeId, items };
};

userSchema.methods.getFridgeItems = function getFridgeItems() {
    return Array.isArray(this.fridge?.items) ? this.fridge.items.map(toPlainFood).filter(Boolean) : [];
};

userSchema.methods.addFood = function addFood(food) {
    if (!(food instanceof Food) && (typeof food !== 'object' || food === null)) {
        throw new TypeError('food must be a Food object or plain object');
    }

    if (!this.fridge) {
        const fridgeId = this.fridgeId || new mongoose.Types.ObjectId().toString();
        this.fridgeId = fridgeId;
        this.fridge = { id: fridgeId, items: [] };
    }

    const foodData = toPlainFood(food);
    const existingFood = this.fridge.items.find((item) => normalizeName(item.name) === normalizeName(foodData.name));

    if (existingFood) {
        existingFood.measurement = Number((Number(existingFood.measurement) + Number(foodData.measurement)).toFixed(1));
    } else {
        this.fridge.items.push(foodData);
    }

    this.markModified('fridge');
    return this.fridge.items;
};

userSchema.methods.removeFood = function removeFood(name) {
    if (!this.fridge) {
        return false;
    }

    const initialCount = this.fridge.items.length;
    this.fridge.items = this.fridge.items.filter((food) => normalizeName(food.name) !== normalizeName(name));
    this.markModified('fridge');
    return this.fridge.items.length < initialCount;
};

userSchema.methods.getSavedFoods = function getSavedFoods() {
    return Array.isArray(this.savedFoods)
        ? this.savedFoods.map((food) => toPlainFood(food, { includeId: true })).filter(Boolean)
        : [];
};

userSchema.methods.saveFood = function saveFood(food) {
    if (typeof food !== 'object' || food === null) {
        throw new TypeError('food must be a plain object');
    }

    const foodData = toPlainFood(food, { includeId: true });
    foodData.id = foodData.id || new mongoose.Types.ObjectId().toString();
    foodData.classification = foodData.classification || 'Other';

    this.savedFoods = Array.isArray(this.savedFoods) ? this.savedFoods : [];

    const existingFood = this.savedFoods.find((item) => normalizeName(item.name) === normalizeName(foodData.name));

    if (existingFood) {
        existingFood.classification = foodData.classification;
        existingFood.measurementClassification = foodData.measurementClassification;
        existingFood.measurement = foodData.measurement;
        existingFood.macronutrients = foodData.macronutrients;
        this.markModified('savedFoods');
        return toPlainFood(existingFood, { includeId: true });
    }

    this.savedFoods.push(foodData);
    this.markModified('savedFoods');
    return foodData;
};

userSchema.methods.addPrivateRecipe = function addPrivateRecipe(recipe) {
    if (!(recipe instanceof Recipe)) {
        throw new TypeError('recipe must be a Recipe object');
    }

    this.privateRecipes.push(recipe);
    this.markModified('privateRecipes');
};

userSchema.methods.addShoppingList = function addShoppingList(shoppingList) {
    if (!(shoppingList instanceof ShoppingList)) {
        throw new TypeError('shoppingList must be a ShoppingList object');
    }

    this.shoppingLists.push(shoppingList);
    this.markModified('shoppingLists');
};

userSchema.methods.setGoal = function setGoal(date, goal) {
    const goalDate = normalizeDate(date);

    if (typeof goalDate !== 'string' || !goalDate.trim()) {
        throw new TypeError('date must be a non-empty string or Date');
    }

    if (!(goal instanceof Goal)) {
        throw new TypeError('goal must be a Goal object');
    }

    this.goals[goalDate.trim()] = goal;
    this.markModified('goals');
};

userSchema.methods.getGoal = function getGoal(date) {
    const goalDate = normalizeDate(date);

    if (typeof goalDate !== 'string' || !goalDate.trim()) {
        throw new TypeError('date must be a non-empty string or Date');
    }

    return this.goals[goalDate.trim()];
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
