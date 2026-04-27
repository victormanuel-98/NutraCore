const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const { protect, optionalProtect } = require('../config/auth');

const BAD_WORDS = ['puto', 'puta', 'mierda', 'cabron', 'cabrona', 'joder', 'fuck', 'shit', 'asshole', 'idiota', 'estupido', 'estupida', 'coño', 'pendejo', 'pendeja'];

const filterBadWords = (text) => {
  if (!text) return text;
  let filtered = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

/**
 * @route   POST /api/reviews
 * @desc    Add or update a review for a recipe
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { recipeId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!recipeId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Receta y valoración son obligatorias'
      });
    }

    const filteredComment = filterBadWords(comment);

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Receta no encontrada'
      });
    }

    // Check if user already reviewed this recipe
    let review = await Review.findOne({ recipe: recipeId, user: userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = filteredComment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        recipe: recipeId,
        user: userId,
        rating,
        comment: filteredComment
      });
    }

    res.status(201).json({
      success: true,
      data: review,
      message: 'Valoración guardada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la valoración'
    });
  }
});

/**
 * @route   GET /api/reviews/recipe/:recipeId
 * @desc    Get all reviews for a recipe
 * @access  Public (Comments hidden for guests)
 */
router.get('/recipe/:recipeId', optionalProtect, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const isAuthenticated = !!req.user;

    const reviews = await Review.find({ recipe: recipeId })
      .populate('user', 'name')
      .sort('-createdAt');

    // Filter comments if not authenticated
    const filteredReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      if (!isAuthenticated) {
        // Users NOT registered can see ratings but NOT comments
        delete reviewObj.comment;
      }
      return reviewObj;
    });

    res.json({
      success: true,
      data: filteredReviews,
      count: filteredReviews.length,
      isAuthenticated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener valoraciones'
    });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Owner only)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Valoración no encontrada'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'No tienes permiso para eliminar esta valoración'
      });
    }

    // Use findOneAndDelete so Review model middleware recalculates recipe average rating/count
    await Review.findByIdAndDelete(review._id);

    res.json({
      success: true,
      message: 'Valoración eliminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar valoración'
    });
  }
});

module.exports = router;
