const {
    foodclassifcations: foodClassifications,
    measurementclassifications: measurementClassifications
} = require("./modelhelpers");

class Food {
    constructor(name, owner, classification, measurementClassification, measurement, macronutrients = {}) {
        if (typeof name !== "string" || !name.trim()) {
            throw new TypeError("name must be a non-empty string");
        }

        if (typeof owner !== "string" || !owner.trim()) {
            throw new TypeError("owner must be a non-empty string");
        }

        if (typeof classification !== "string" || !classification.trim()) {
            throw new TypeError("classification must be a non-empty string");
        }

        const normalizedClassification = classification.trim();
        if (!foodClassifications.includes(normalizedClassification)) {
            throw new TypeError(`classification must be one of: ${foodClassifications.join(", ")}`);
        }

        if (typeof measurementClassification !== "string" || !measurementClassification.trim()) {
            throw new TypeError("measurementClassification must be a non-empty string");
        }

        const normalizedMeasurementClassification = measurementClassification.trim();
        if (!measurementClassifications.includes(normalizedMeasurementClassification)) {
            throw new TypeError(`measurementClassification must be one of: ${measurementClassifications.join(", ")}`);
        }

        if (typeof measurement !== "number" || !Number.isFinite(measurement)) {
            throw new TypeError("measurement must be a finite number");
        }

        if (macronutrients === null || typeof macronutrients !== "object" || Array.isArray(macronutrients)) {
            throw new TypeError("macronutrients must be an object");
        }
        this.name = name;
        this.owner = owner;
        this.classification = normalizedClassification;
        this.measurementClassification = normalizedMeasurementClassification;
        this.measurement = measurement;
        this.macronutrients = macronutrients;
    }
}

module.exports = Food;