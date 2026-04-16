/**
 * Modelo de Usuario
 * 
 * Esquema Mongoose para los usuarios de NutraCore
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Datos de autenticación
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
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },

  // Datos personales
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
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
    type: Number, // en cm
    min: [50, 'Altura inválida'],
    max: [300, 'Altura inválida']
  },
  weight: {
    type: Number, // en kg
    min: [20, 'Peso inválido'],
    max: [500, 'Peso inválido']
  },

  // Objetivos nutricionales
  goals: {
    targetWeight: {
      type: Number,
      min: [20, 'Peso objetivo inválido'],
      max: [500, 'Peso objetivo inválido']
    },
    dailyCalories: {
      type: Number,
      default: 2000,
      min: [800, 'Calorías diarias demasiado bajas'],
      max: [10000, 'Calorías diarias demasiado altas']
    },
    protein: { type: Number, default: 150 }, // gramos
    carbs: { type: Number, default: 250 },
    fats: { type: Number, default: 65 },
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

  // Platos favoritos
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }],

  // Noticias guardadas
  savedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],

  // Preferencias
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

  // Metadata
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Middleware: Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada
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

// Método: Comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método: Obtener perfil público (sin contraseña)
userSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Método: Calcular IMC
userSchema.methods.calculateBMI = function() {
  if (!this.weight || !this.height) {
    return null;
  }
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
