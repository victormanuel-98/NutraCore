const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'La receta es obligatoria']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio']
    },
    rating: {
      type: Number,
      required: [true, 'La valoración es obligatoria'],
      min: [1, 'La valoración mínima es 1'],
      max: [5, 'La valoración máxima es 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'El comentario no puede superar los 1000 caracteres']
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews from the same user on the same recipe
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(recipeId) {
  const stats = await this.aggregate([
    {
      $match: { recipe: recipeId }
    },
    {
      $group: {
        _id: '$recipe',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
      reviewsCount: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
      reviewsCount: 0,
      averageRating: 0
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.recipe);
});

// Call calculateAverageRating before remove (using findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.recipe);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
