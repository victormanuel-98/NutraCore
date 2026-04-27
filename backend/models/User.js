/**
 * Modelo de Usuario
 *
 * Esquema Mongoose para los usuarios de NutraCore
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [7, 'La contraseña debe tener más de 6 caracteres'],
      validate: {
        validator: (value) => strongPasswordRegex.test(value),
        message:
          'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales'
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
      min: [13, 'Debes tener al menos 13 años'],
      max: [120, 'Edad inválida']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },
    height: {
      type: Number,
      min: [50, 'Altura inválida'],
      max: [300, 'Altura inválida']
    },
    weight: {
      type: Number,
      min: [20, 'Peso inválido'],
      max: [500, 'Peso inválido']
    },

    goals: {
      targetWeight: {
        type: Number,
        min: [20, 'Peso objetivo inválido'],
        max: [500, 'Peso objetivo inválido']
      },
      dailyCalories: {
        type: Number,
        default: 0,
        min: [0, 'Calorías diarias inválidas'],
        max: [10000, 'Calorías diarias demasiado altas']
      },
      protein: { type: Number, default: 0, min: [0, 'Proteína inválida'] },
      carbs: { type: Number, default: 0, min: [0, 'Carbohidratos inválidos'] },
      fats: { type: Number, default: 0, min: [0, 'Grasas inválidas'] },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
