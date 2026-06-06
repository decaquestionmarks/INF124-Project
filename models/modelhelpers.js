const foodclassifcations = ["Meat", "Produce", "Bakery", "Dairy", "Pantry", "Frozen", "Drinks", "Snacks", "Condiments", "Spices and Baking", "Other"]
const measurementclassifications = ["grams", "ml", "Servings", "Pieces", "Other"]
const goalMacros = ["calories", "protein", "carbs", "fat"]
const goalMicros = ["fiber", "sugar", "calcium", "iron", "potassium", "sodium"]

const measurementAliases = {
    mass: "grams",
    gram: "grams",
    grams: "grams",
    g: "grams",
    volume: "ml",
    milliliter: "ml",
    milliliters: "ml",
    ml: "ml",
    serving: "Servings",
    servings: "Servings",
    piece: "Pieces",
    pieces: "Pieces",
    other: "Other",
}

const normalizeMeasurementClassification = (value) => {
    if (typeof value !== "string") return value

    const trimmed = value.trim()
    if (!trimmed) return trimmed

    return measurementAliases[trimmed.toLowerCase()] || trimmed
}

module.exports = { foodclassifcations, measurementclassifications, goalMacros, goalMicros, normalizeMeasurementClassification }
