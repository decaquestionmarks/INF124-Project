const Food = require('./food');

class Fridge {
    constructor(id) {
        if (typeof id !== 'string' && typeof id !== 'number' && typeof id !== 'undefined') {
            throw new TypeError('id must be a string or number');
        }

        this.id = typeof id === 'undefined' ? String(Date.now()) : id;
        this.items = [];
    }

    addFood(food) {
        if (food instanceof Food) {
            const existing = this.items.find((f) => f.name === food.name);
            if (existing) {
                existing.measurement = Number((Number(existing.measurement) + Number(food.measurement)).toFixed(1));
            } else {
                this.items.push(food);
            }
            return;
        }

        // allow plain objects for flexibility
        if (typeof food === 'object' && food !== null && food.name) {
            const existing = this.items.find((f) => f.name === food.name);
            if (existing && typeof food.measurement !== 'undefined') {
                existing.measurement = Number((Number(existing.measurement) + Number(food.measurement)).toFixed(1));
            } else {
                this.items.push(food);
            }
            return;
        }

        throw new TypeError('food must be a Food object or plain object with a name');
    }

    removeFood(name) {
        const initial = this.items.length;
        this.items = this.items.filter((food) => food.name !== name);
        return this.items.length < initial;
    }

    getItems() {
        return this.items;
    }
}

module.exports = Fridge;
