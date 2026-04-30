/**
 * Rutas de Usuario
 * 
 * Endpoints para gestiÃ³n de perfil y configuraciÃ³n
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { protect, requireAdmin } = require('../config/auth');
const { isAdmin, canAdminManageUser } = require('../middleware/rbac');
const { logAuditEvent } = require('../services/auditService');
const { validateObjectIdParam } = require('../middleware/validation');

const serializeAdminUser = (user, { recipesCount = 0, reviewsCount = 0 } = {}) => {
  const publicProfile = user.toPublicProfile();
  return {
    ...publicProfile,
    id: String(publicProfile._id),
    recipesCount,
    reviewsCount
  };
};

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
    const recipeFavoritesCount = await Recipe.countDocuments({ favoritedBy: req.user._id, isDeleted: { $ne: true } });

    // Calcular IMC si tiene los datos necesarios
    const bmi = user.calculateBMI();

    res.json({
      success: true,
      data: {
        ...user.toPublicProfile(),
        bmi,
        recipeFavoritesCount
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
    const [recipeFavoritesCount, totalRecipes] = await Promise.all([
      Recipe.countDocuments({ favoritedBy: req.user._id, isDeleted: { $ne: true } }),
      Recipe.countDocuments({ author: user._id, isDeleted: { $ne: true } })
    ]);

    // Calcular estadÃ­sticas
    const stats = {
      totalFavorites: recipeFavoritesCount,
      totalRecipeFavorites: recipeFavoritesCount,
      totalDishFavorites: user.favorites.length,
      totalSavedNews: user.savedNews.length,
      totalRecipes,
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

    if (isAdmin(user)) {
      return res.status(403).json({
        success: false,
        error: 'La cuenta admin no puede eliminarse ni desactivarse desde esta ruta'
      });
    }

    user.isActive = false;
    user.deletedAt = new Date();
    user.deletedBy = req.user._id;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await logAuditEvent({
      req,
      actor: req.user,
      action: 'user.self.soft_delete',
      targetType: 'User',
      targetId: user._id
    });

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
 * @route   GET /api/users/admin/list
 * @desc    Listar usuarios para administración
 * @access  Admin
 */
router.get('/admin/list', protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [recipesCount, reviewsCount] = await Promise.all([
          Recipe.countDocuments({ author: user._id, isDeleted: { $ne: true } }),
          Review.countDocuments({ user: user._id })
        ]);
        return serializeAdminUser(user, { recipesCount, reviewsCount });
      })
    );

    return res.json({
      success: true,
      data: usersWithStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al listar usuarios'
    });
  }
});

/**
 * @route   GET /api/users/admin/:id
 * @desc    Ver perfil de un usuario por ID
 * @access  Admin
 */
router.get('/admin/:id', validateObjectIdParam('id'), protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .populate('favorites', 'name image nutrition category')
      .populate('favoriteRecipes', 'title category difficulty prepTime')
      .populate('savedNews', 'title summary image category');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const [recipesCount, reviewsCount] = await Promise.all([
      Recipe.countDocuments({ author: user._id, isDeleted: { $ne: true } }),
      Review.countDocuments({ user: user._id })
    ]);

    return res.json({
      success: true,
      data: serializeAdminUser(user, { recipesCount, reviewsCount })
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});

/**
 * @route   PATCH /api/users/admin/:id/status
 * @desc    Suspender/reactivar usuario
 * @access  Admin
 */
router.patch('/admin/:id/status', validateObjectIdParam('id'), protect, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const nextStatus = Boolean(isActive);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!canAdminManageUser(targetUser, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'No está permitido modificar este usuario'
      });
    }

    targetUser.isActive = nextStatus;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    await logAuditEvent({
      req,
      actor: req.user,
      action: nextStatus ? 'user.reactivate' : 'user.suspend',
      targetType: 'User',
      targetId: targetUser._id
    });

    return res.json({
      success: true,
      data: targetUser.toPublicProfile(),
      message: nextStatus ? 'Usuario reactivado correctamente' : 'Usuario suspendido correctamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al actualizar el estado del usuario'
    });
  }
});

/**
 * @route   DELETE /api/users/admin/:id
 * @desc    Eliminar usuario (solo admins y nunca cuentas admin)
 * @access  Admin
 */
router.delete('/admin/:id', validateObjectIdParam('id'), protect, requireAdmin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!canAdminManageUser(targetUser, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'No está permitido eliminar este usuario'
      });
    }

    const ownedRecipes = await Recipe.find({ author: targetUser._id }).select('_id');
    const ownedRecipeIds = ownedRecipes.map((recipe) => recipe._id);

    await Promise.all([
      Review.deleteMany({ user: targetUser._id }),
      Review.deleteMany({ recipe: { $in: ownedRecipeIds } }),
      Recipe.updateMany(
        { author: targetUser._id },
        {
          $set: {
            isDeleted: true,
            isPublished: false,
            deletedAt: new Date(),
            deletedBy: req.user._id,
            favoritedBy: [],
            favoritesCount: 0
          }
        }
      ),
      Recipe.updateMany(
        { favoritedBy: targetUser._id },
        { $pull: { favoritedBy: targetUser._id }, $inc: { favoritesCount: -1 } }
      ),
      User.updateMany({ favoriteRecipes: { $in: ownedRecipeIds } }, { $pull: { favoriteRecipes: { $in: ownedRecipeIds } } })
    ]);

    targetUser.isActive = false;
    targetUser.deletedAt = new Date();
    targetUser.deletedBy = req.user._id;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    await logAuditEvent({
      req,
      actor: req.user,
      action: 'user.admin.soft_delete',
      targetType: 'User',
      targetId: targetUser._id
    });

    return res.json({
      success: true,
      message: 'Usuario eliminado correctamente (soft-delete)'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    });
  }
});

router.patch('/admin/:id/restore', validateObjectIdParam('id'), protect, requireAdmin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No está permitido restaurar esta cuenta'
      });
    }

    targetUser.isActive = true;
    targetUser.deletedAt = null;
    targetUser.deletedBy = null;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    await logAuditEvent({
      req,
      actor: req.user,
      action: 'user.restore',
      targetType: 'User',
      targetId: targetUser._id
    });

    return res.json({
      success: true,
      message: 'Usuario restaurado correctamente'
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Error al restaurar usuario'
    });
  }
});

router.get('/admin/audit/logs', protect, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const logs = await AuditLog.find({})
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      data: logs
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Error al obtener la auditoria'
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
