/**
 * Modelo de Usuario
 *
 * Esquema Mongoose para los usuarios de NutraCore
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { EMAIL_REGEX, isEmailLocalPartTooLong } = require('../utils/emailValidation');

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Email invalido'],
      validate: {
        validator: (value) => !isEmailLocalPartTooLong(value),
        message: 'La parte anterior a @ debe tener como maximo 30 caracteres'
      }
    },
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      minlength: [7, 'La contrasena debe tener mas de 6 caracteres'],
      validate: {
        validator: (value) => strongPasswordRegex.test(value),
        message:
          'La contrasena debe incluir mayusculas, minusculas, numeros y caracteres especiales'
      }
    },

    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    age: {
      type: Number,
      min: [13, 'Debes tener al menos 13 anos'],
      max: [120, 'Edad invalida']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },
    height: {
      type: Number,
      min: [50, 'Altura invalida'],
      max: [300, 'Altura invalida']
    },
    weight: {
      type: Number,
      min: [20, 'Peso invalido'],
      max: [500, 'Peso invalido']
    },

    goals: {
      targetWeight: {
        type: Number,
        min: [20, 'Peso objetivo invalido'],
        max: [500, 'Peso objetivo invalido']
      },
      dailyCalories: {
        type: Number,
        default: 0,
        min: [0, 'Calorias diarias invalidas'],
        max: [10000, 'Calorias diarias demasiado altas']
      },
      protein: { type: Number, default: 0, min: [0, 'Proteina invalida'] },
      carbs: { type: Number, default: 0, min: [0, 'Carbohidratos invalidos'] },
      fats: { type: Number, default: 0, min: [0, 'Grasas invalidas'] },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
        default: 'moderate'
      },
      goal: {
        type: String,
        enum: ['lose-weight', 'maintain', 'gain-muscle', 'improve-health'],
        default: 'maintain'
      }
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
      }
    ],

    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      }
    ],

    savedNews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News'
      }
    ],

    preferences: {
      dietary: {
        type: [String],
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'],
        default: []
      },
      allergies: {
        type: [String],
        default: []
      }
    },

    avatar: {
      type: String,
      default: null
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0
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

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function toPublicProfile() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
};

userSchema.methods.calculateBMI = function calculateBMI() {
  if (!this.weight || !this.height) {
    return null;
  }
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
};

userSchema.methods.incrementTokenVersion = async function incrementTokenVersion() {
  this.tokenVersion = (this.tokenVersion || 0) + 1;
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
