const mongoose = require('mongoose');
const { normalizeEnumValue } = require('../utils/normalization');

const RECIPE_CATEGORIES = [
  'desayuno',
  'almuerzo/cena',
  'merienda',
  'snack',
  'post-entreno',
  'cena ligera'
];

const RECIPE_DIFFICULTIES = ['facil', 'media', 'dificil'];
const RECIPE_TAG_OPTIONS = [
  'alta-proteina',
  'bajo-en-calorias',
  'bajo-en-carbohidratos',
  'alto-en-fibra',
  'rapido',
  'facil',
  'sin-lactosa',
  'sin-gluten',
  'vegano',
  'vegetariano',
  'pre-entreno',
  'post-entreno',
  'meal-prep',
  'economico',
  'hidratante',
  'saciante'
];

const MAX_RECIPE_IMAGES = 5;
const MAX_RECIPE_INGREDIENTS = 20;
const MAX_RECIPE_STEPS = 20;
const MAX_RECIPE_PREP_TIME = 999;
const MAX_STEP_WORDS = 80;
const normalizeRecipeDifficulty = (value) => normalizeEnumValue(value, RECIPE_DIFFICULTIES);

const dataUrlRegex = /^data:image\/(png|jpe?g|webp|gif|avif|svg\+xml);base64,[A-Za-z0-9+/=\r\n]+$/i;
const imageUrlRegex = /^https?:\/\/.+\.(png|jpe?g|webp)(\?.*)?$/i;

const hasValidStepLength = (steps = []) =>
  Array.isArray(steps) &&
  steps.every((step) => {
    const words = String(step || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return words.length <= MAX_STEP_WORDS;
  });

const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, min: 0, default: 0 },
    protein: { type: Number, min: 0, default: 0 },
    carbs: { type: Number, min: 0, default: 0 },
    fats: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true,
      minlength: [3, 'El titulo es demasiado corto'],
      maxlength: [120, 'El titulo no puede superar 120 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripcion es obligatoria'],
      trim: true,
      minlength: [10, 'La descripcion es demasiado corta'],
      maxlength: [1200, 'La descripcion no puede superar 1200 caracteres']
    },
    ingredients: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'Debes indicar al menos un ingrediente'
        },
        {
          validator: (value) => Array.isArray(value) && value.length <= MAX_RECIPE_INGREDIENTS,
          message: `Puedes indicar un maximo de ${MAX_RECIPE_INGREDIENTS} ingredientes`
        }
      ]
    },
    steps: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'Debes indicar al menos un paso de preparacion'
        },
        {
          validator: (value) => Array.isArray(value) && value.length <= MAX_RECIPE_STEPS,
          message: `Puedes indicar un maximo de ${MAX_RECIPE_STEPS} pasos`
        },
        {
          validator: hasValidStepLength,
          message: `Cada paso puede tener un maximo de ${MAX_STEP_WORDS} palabras`
        }
      ]
    },
    category: {
      type: String,
      required: [true, 'La categoria es obligatoria'],
      enum: {
        values: RECIPE_CATEGORIES,
        message: 'Categoria no valida'
      }
    },
    images: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (value) => Array.isArray(value) && value.length <= MAX_RECIPE_IMAGES,
          message: `Puedes subir un maximo de ${MAX_RECIPE_IMAGES} imagenes por receta`
        },
        {
          validator: (value) =>
            value.every((image) => typeof image === 'string' && image.length > 0 && imageUrlRegex.test(image)),
          message: 'Las imagenes deben ser URLs validas en formato PNG, JPG, JPEG o WEBP'
        }
      ]
    },
    prepTime: {
      type: Number,
      required: [true, 'El tiempo de preparacion es obligatorio'],
      min: [1, 'El tiempo de preparacion debe ser al menos 1 minuto'],
      max: [MAX_RECIPE_PREP_TIME, `El tiempo de preparacion no puede superar ${MAX_RECIPE_PREP_TIME} minutos`]
    },
    difficulty: {
      type: String,
      required: [true, 'La dificultad es obligatoria'],
      set: normalizeRecipeDifficulty,
      enum: {
        values: RECIPE_DIFFICULTIES,
        message: 'Dificultad no valida'
      }
    },
    nutrition: {
      type: nutritionSchema,
      default: () => ({})
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 3,
        message: 'Puedes asignar un maximo de 3 tags por receta'
      }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es obligatorio']
    },
    favoritedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    favoritesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

recipeSchema.pre('save', function updateFavoritesCount(next) {
  this.favoritesCount = Array.isArray(this.favoritedBy) ? this.favoritedBy.length : 0;
  next();
});

recipeSchema.virtual('isPopular').get(function isPopular() {
  return (this.favoritesCount || 0) >= 10;
});

recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ category: 1, difficulty: 1, createdAt: -1 });
recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ favoritesCount: -1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
module.exports.Recipe = Recipe;
module.exports.RECIPE_CATEGORIES = RECIPE_CATEGORIES;
module.exports.RECIPE_DIFFICULTIES = RECIPE_DIFFICULTIES;
module.exports.RECIPE_TAG_OPTIONS = RECIPE_TAG_OPTIONS;
module.exports.normalizeRecipeDifficulty = normalizeRecipeDifficulty;
module.exports.DATA_URL_REGEX = dataUrlRegex;
module.exports.MAX_RECIPE_IMAGES = MAX_RECIPE_IMAGES;
module.exports.MAX_RECIPE_INGREDIENTS = MAX_RECIPE_INGREDIENTS;
module.exports.MAX_RECIPE_STEPS = MAX_RECIPE_STEPS;
module.exports.MAX_RECIPE_PREP_TIME = MAX_RECIPE_PREP_TIME;
module.exports.MAX_STEP_WORDS = MAX_STEP_WORDS;
