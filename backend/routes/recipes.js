const express = require('express');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getMyRecipes,
  getPopularRecipes
} = require('../controllers/recipeController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, getRecipes);
router.get('/user/me', protect, getMyRecipes);
router.get('/featured/popular', getPopularRecipes);
router.get('/:id', optionalProtect, getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
