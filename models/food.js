const mongoose = require('../backend/node_modules/mongoose');
const {
    foodclassifcations: foodClassifications,
    measurementclassifications: measurementClassifications,
} = require('./modelhelpers');

const macronutrientSchema = new mongoose.Schema(
    {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
        calcium: { type: Number, default: 0 },
        iron: { type: Number, default: 0 },
        potassium: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 },
    },
    { _id: false }
);

const foodSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        classification: {
            type: String,
            required: true,
            trim: true,
            enum: foodClassifications,
        },
        measurementClassification: {
            type: String,
            required: true,
            trim: true,
            enum: measurementClassifications,
        },
        measurement: { type: Number, required: true },
        macronutrients: { type: macronutrientSchema, default: () => ({}) },
    },
    { timestamps: true }
);

foodSchema.statics.normalizeName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

foodSchema.methods.toFoodObject = function toFoodObject() {
    return {
        id: this._id.toString(),
        name: this.name,
        classification: this.classification,
        measurementClassification: this.measurementClassification,
        measurement: this.measurement,
        macronutrients: this.macronutrients ? { ...this.macronutrients } : {},
    };
};

foodSchema.statics.fromInput = function fromInput(input = {}) {
    return new this({
        name: input.name,
        classification: input.classification,
        measurementClassification: input.measurementClassification,
        measurement: Number(input.measurement),
        macronutrients: input.macronutrients || {},
    });
};

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

module.exports = Food;