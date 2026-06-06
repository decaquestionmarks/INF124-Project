const mongoose = require('../backend/node_modules/mongoose');
const Food = require('./food');
const Recipe = require('./recipe');
const ShoppingList = require('./shoppinglist');
const Goal = require('./goal');

const fridgeItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        classification: { type: String, trim: true },
        measurementClassification: { type: String, required: true, trim: true },
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
        goals: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

const normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const normalizeDate = (date) => (date instanceof Date ? date.toISOString().slice(0, 10) : date);

const toPlainFood = (food) => {
    if (!food) return null;

    if (typeof food.toObject === 'function') {
        const object = food.toObject();
        return {
            name: object.name,
            classification: object.classification,
            measurementClassification: object.measurementClassification,
            measurement: object.measurement,
            macronutrients: object.macronutrients || {},
        };
    }

    return {
        name: food.name,
        classification: food.classification,
        measurementClassification: food.measurementClassification,
        measurement: food.measurement,
        macronutrients: food.macronutrients || {},
    };
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
    return Array.isArray(this.fridge?.items) ? this.fridge.items : [];
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
