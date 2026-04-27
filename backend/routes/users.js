/**
 * Rutas de Usuario
 * 
 * Endpoints para gestiÃ³n de perfil y configuraciÃ³n
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../config/auth');

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'name image nutrition category')
      .populate('savedNews', 'title summary image category');

    // Calcular IMC si tiene los datos necesarios
    const bmi = user.calculateBMI();

    res.json({
      success: true,
      data: {
        ...user.toPublicProfile(),
        bmi
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      avatar,
      preferences
    } = req.body;

    const user = await User.findById(req.user._id);

    // Actualizar campos si se proporcionan
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      data: user.toPublicProfile(),
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil'
    });
  }
});

/**
 * @route   PUT /api/users/goals
 * @desc    Actualizar objetivos nutricionales
 * @access  Private
 */
router.put('/goals', protect, async (req, res) => {
  try {
    const {
      targetWeight,
      dailyCalories,
      protein,
      carbs,
      fats,
      activityLevel,
      goal
    } = req.body;

    const user = await User.findById(req.user._id);

    // Actualizar objetivos
    if (targetWeight !== undefined) user.goals.targetWeight = targetWeight;
    if (dailyCalories !== undefined) user.goals.dailyCalories = dailyCalories;
    if (protein !== undefined) user.goals.protein = protein;
    if (carbs !== undefined) user.goals.carbs = carbs;
    if (fats !== undefined) user.goals.fats = fats;
    if (activityLevel !== undefined) user.goals.activityLevel = activityLevel;
    if (goal !== undefined) user.goals.goal = goal;

    await user.save();

    res.json({
      success: true,
      data: {
        goals: user.goals
      },
      message: 'Objetivos actualizados exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar objetivos:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar objetivos'
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Obtener estadÃ­sticas del usuario
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites')
      .populate('savedNews');

    const Recipe = require('../models/Recipe');
    const userRecipes = await Recipe.find({ author: user._id });

    // Calcular estadÃ­sticas
    const stats = {
      totalFavorites: user.favorites.length,
      totalSavedNews: user.savedNews.length,
      totalRecipes: userRecipes.length,
      bmi: user.calculateBMI(),
      goalProgress: null
    };

    // Calcular progreso hacia objetivo de peso
    if (user.weight && user.goals.targetWeight) {
      const current = user.weight;
      const target = user.goals.targetWeight;
      const difference = Math.abs(current - target);
      // Progress is based on current distance to target relative to current weight.
      const baseline = Math.max(1, Math.abs(current));
      const progress = difference === 0
        ? 100
        : Math.max(0, Math.min(100, 100 - (difference / baseline) * 100));
      
      stats.goalProgress = {
        current,
        target,
        difference,
        progress: Math.round(progress)
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadÃ­sticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadÃ­sticas'
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Desactivar cuenta
 * @access  Private
 */
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Cuenta desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar cuenta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al desactivar cuenta'
    });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Actualizar preferencias dietÃ©ticas
 * @access  Private
 */
router.put('/preferences', protect, async (req, res) => {
  try {
    const { dietary, allergies } = req.body;

    const user = await User.findById(req.user._id);

    if (dietary) user.preferences.dietary = dietary;
    if (allergies) user.preferences.allergies = allergies;

    await user.save();

    res.json({
      success: true,
      data: {
        preferences: user.preferences
      },
      message: 'Preferencias actualizadas exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar preferencias'
    });
  }
});

module.exports = router;
