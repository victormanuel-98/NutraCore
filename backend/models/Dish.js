/**
 * Modelo de Plato
 * 
 * Esquema Mongoose para el catálogo de platos de NutraCore
 */

const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: [true, 'El nombre del plato es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [500, 'La descripción es demasiado larga']
  },
  image: {
    type: String,
    required: [true, 'La imagen es obligatoria']
  },

  // Categoría
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'dessert',
      'protein',
      'vegetarian',
      'vegan',
      'low-carb',
      'high-protein'
    ]
  },

  // Información nutricional (por porción)
  nutrition: {
    calories: {
      type: Number,
      required: [true, 'Las calorías son obligatorias'],
      min: [0, 'Las calorías no pueden ser negativas']
    },
    protein: {
      type: Number,
      required: [true, 'Las proteínas son obligatorias'],
      min: [0, 'Las proteínas no pueden ser negativas']
    },
    carbs: {
      type: Number,
      required: [true, 'Los carbohidratos son obligatorios'],
      min: [0, 'Los carbohidratos no pueden ser negativos']
    },
    fats: {
      type: Number,
      required: [true, 'Las grasas son obligatorias'],
      min: [0, 'Las grasas no pueden ser negativas']
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'La fibra no puede ser negativa']
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'El azúcar no puede ser negativo']
    }
  },

  // Detalles de preparación
  servings: {
    type: Number,
    default: 1,
    min: [1, 'Debe tener al menos 1 porción']
  },
  prepTime: {
    type: Number, // en minutos
    required: [true, 'El tiempo de preparación es obligatorio'],
    min: [0, 'El tiempo de preparación no puede ser negativo']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  // Ingredientes
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    }
  }],

  // Instrucciones
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],

  // Etiquetas y preferencias dietéticas
  tags: {
    type: [String],
    enum: [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo',
      'low-carb',
      'high-protein',
      'low-calorie',
      'quick',
      'budget-friendly'
    ],
    default: []
  },

  // Popularidad
  favorites: {
    type: Number,
    default: 0,
    min: [0, 'Los favoritos no pueden ser negativos']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Las vistas no pueden ser negativas']
  },

  // Estado
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para búsqueda optimizada
dishSchema.index({ name: 'text', description: 'text' });
dishSchema.index({ category: 1 });
dishSchema.index({ tags: 1 });
dishSchema.index({ 'nutrition.calories': 1 });

// Método virtual: Calcular ratio de macronutrientes
dishSchema.virtual('macroRatio').get(function() {
  const total = this.nutrition.protein + this.nutrition.carbs + this.nutrition.fats;
  return {
    protein: ((this.nutrition.protein / total) * 100).toFixed(1),
    carbs: ((this.nutrition.carbs / total) * 100).toFixed(1),
    fats: ((this.nutrition.fats / total) * 100).toFixed(1)
  };
});

// Método: Incrementar contador de favoritos
dishSchema.methods.addFavorite = function() {
  this.favorites += 1;
  return this.save();
};

// Método: Decrementar contador de favoritos
dishSchema.methods.removeFavorite = function() {
  if (this.favorites > 0) {
    this.favorites -= 1;
  }
  return this.save();
};

// Método: Incrementar vistas
dishSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
