/**
 * Modelo de Noticia
 * 
 * Esquema Mongoose para las noticias y artículos de NutraCore
 */

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  // Información básica
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título es demasiado largo']
  },
  summary: {
    type: String,
    required: [true, 'El resumen es obligatorio'],
    maxlength: [300, 'El resumen es demasiado largo']
  },
  content: {
    type: String,
    required: [true, 'El contenido es obligatorio']
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
      'nutrition',
      'fitness',
      'recipes',
      'wellness',
      'science',
      'tips',
      'news'
    ]
  },

  // Autor
  author: {
    name: {
      type: String,
      required: [true, 'El nombre del autor es obligatorio']
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: 'Nutricionista'
    }
  },

  // Etiquetas
  tags: {
    type: [String],
    default: []
  },

  // Métricas
  views: {
    type: Number,
    default: 0,
    min: [0, 'Las vistas no pueden ser negativas']
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Los likes no pueden ser negativos']
  },
  shares: {
    type: Number,
    default: 0,
    min: [0, 'Los compartidos no pueden ser negativos']
  },
  saves: {
    type: Number,
    default: 0,
    min: [0, 'Los guardados no pueden ser negativos']
  },

  // Tiempo de lectura estimado (minutos)
  readTime: {
    type: Number,
    default: 5,
    min: [1, 'El tiempo de lectura debe ser al menos 1 minuto']
  },

  // Estado de publicación
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsqueda optimizada
newsSchema.index({ title: 'text', summary: 'text', content: 'text' });
newsSchema.index({ category: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ status: 1 });

// Método virtual: Calcular tiempo de lectura basado en contenido
newsSchema.virtual('calculatedReadTime').get(function() {
  // Promedio de 200 palabras por minuto
  const words = this.content.split(/\s+/).length;
  return Math.ceil(words / 200);
});

// Método: Incrementar vistas
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método: Incrementar likes
newsSchema.methods.addLike = function() {
  this.likes += 1;
  return this.save();
};

// Método: Decrementar likes
newsSchema.methods.removeLike = function() {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Método: Incrementar guardados
newsSchema.methods.addSave = function() {
  this.saves += 1;
  return this.save();
};

// Método: Decrementar guardados
newsSchema.methods.removeSave = function() {
  if (this.saves > 0) {
    this.saves -= 1;
  }
  return this.save();
};

// Método: Incrementar compartidos
newsSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

const News = mongoose.model('News', newsSchema);

module.exports = News;
