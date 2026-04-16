/**
 * Modelo de Receta
 * 
 * Esquema Mongoose para las recetas creadas en NutraCore Lab
 */

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    // Usuario creador
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },

    // Información básica
    name: {
        type: String,
        required: [true, 'El nombre de la receta es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre es demasiado largo']
    },
    description: {
        type: String,
        maxlength: [500, 'La descripción es demasiado larga']
    },

    // Ingredientes con información nutricional
    ingredients: [{
        name: {
            type: String,
            required: [true, 'El nombre del ingrediente es obligatorio']
        },
        amount: {
            type: Number,
            required: [true, 'La cantidad es obligatoria'],
            min: [0, 'La cantidad no puede ser negativa']
        },
        unit: {
            type: String,
            required: [true, 'La unidad es obligatoria'],
            enum: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'unit']
        },
        // Valores nutricionales por 100g o por unidad
        nutrition: {
            calories: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            fats: { type: Number, default: 0 },
            fiber: { type: Number, default: 0 }
        }
    }],

    // Información nutricional total calculada
    totalNutrition: {
        calories: {
            type: Number,
            required: true,
            default: 0
        },
        protein: {
            type: Number,
            required: true,
            default: 0
        },
        carbs: {
            type: Number,
            required: true,
            default: 0
        },
        fats: {
            type: Number,
            required: true,
            default: 0
        },
        fiber: {
            type: Number,
            default: 0
        }
    },

    // Porciones
    servings: {
        type: Number,
        required: [true, 'El número de porciones es obligatorio'],
        min: [1, 'Debe tener al menos 1 porción'],
        default: 1
    },

    // Información adicional
    prepTime: {
        type: Number, // en minutos
        default: 0
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'],
        default: 'other'
    },

    // Notas personales
    notes: {
        type: String,
        maxlength: [1000, 'Las notas son demasiado largas']
    },

    // Etiquetas personalizadas
    tags: {
        type: [String],
        default: []
    },

    // Favorito personal
    isFavorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índices
recipeSchema.index({ user: 1 });
recipeSchema.index({ name: 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ createdAt: -1 });

// Método virtual: Calcular nutrición por porción
recipeSchema.virtual('nutritionPerServing').get(function () {
    if (!this.servings || this.servings === 0) {
        return this.totalNutrition;
    }

    return {
        calories: Math.round(this.totalNutrition.calories / this.servings),
        protein: Math.round(this.totalNutrition.protein / this.servings),
        carbs: Math.round(this.totalNutrition.carbs / this.servings),
        fats: Math.round(this.totalNutrition.fats / this.servings),
        fiber: Math.round(this.totalNutrition.fiber / this.servings)
    };
});

// Método: Calcular nutrición total basada en ingredientes
recipeSchema.methods.calculateTotalNutrition = function () {
    let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0
    };

    this.ingredients.forEach(ingredient => {
        if (ingredient.nutrition) {
            // Calcular basado en la cantidad
            // Asumimos que los valores nutricionales son por 100g/100ml
            let multiplier = ingredient.amount / 100;

            if (['cup', 'tbsp', 'tsp', 'unit'].includes(ingredient.unit)) {
                // Usar conversiones aproximadas para unidades no métricas
                multiplier = ingredient.amount;
            }

            totals.calories += (ingredient.nutrition.calories || 0) * multiplier;
            totals.protein += (ingredient.nutrition.protein || 0) * multiplier;
            totals.carbs += (ingredient.nutrition.carbs || 0) * multiplier;
            totals.fats += (ingredient.nutrition.fats || 0) * multiplier;
            totals.fiber += (ingredient.nutrition.fiber || 0) * multiplier;
        }
    });

    this.totalNutrition = {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats),
        fiber: Math.round(totals.fiber)
    };

    return this.totalNutrition;
};

// Middleware: Calcular nutrición total antes de guardar
recipeSchema.pre('save', function (next) {
    if (this.ingredients && this.ingredients.length > 0) {
        this.calculateTotalNutrition();
    }
    next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
