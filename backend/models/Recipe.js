const mongoose = require('mongoose');

const RECIPE_CATEGORIES = [
  'desayuno',
  'almuerzo/cena',
  'merienda',
  'snack',
  'post-entreno',
  'cena ligera'
];

const RECIPE_DIFFICULTIES = ['fácil', 'media', 'difícil'];
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

const dataUrlRegex = /^data:image\/(png|jpe?g|webp|gif|avif|svg\+xml);base64,[A-Za-z0-9+/=\r\n]+$/i;

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
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título es demasiado corto'],
      maxlength: [120, 'El título no puede superar 120 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      minlength: [10, 'La descripción es demasiado corta'],
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres']
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Debes indicar al menos un ingrediente'
      }
    },
    steps: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Debes indicar al menos un paso de preparación'
      }
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: RECIPE_CATEGORIES,
        message: 'Categoría no válida'
      }
    },
    images: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (value) => Array.isArray(value) && value.length <= 5,
          message: 'Puedes subir un máximo de 5 imágenes por receta'
        },
        {
          validator: (value) => value.every((image) => typeof image === 'string' && image.length > 0),
          message: 'Las imágenes deben ser URLs válidas'
        }
      ]
    },
    prepTime: {
      type: Number,
      required: [true, 'El tiempo de preparación es obligatorio'],
      min: [1, 'El tiempo de preparación debe ser al menos 1 minuto'],
      max: [1440, 'El tiempo de preparación no puede superar 1440 minutos']
    },
    difficulty: {
      type: String,
      required: [true, 'La dificultad es obligatoria'],
      enum: {
        values: RECIPE_DIFFICULTIES,
        message: 'Dificultad no válida'
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
        message: 'Puedes asignar un máximo de 3 tags por receta'
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
module.exports.DATA_URL_REGEX = dataUrlRegex;

