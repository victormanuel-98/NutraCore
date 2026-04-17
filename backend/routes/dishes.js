/**
 * Rutas de Platos
 * 
 * Endpoints para el catÃ¡logo de platos
 */

const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');
const User = require('../models/User');
const { protect } = require('../config/auth');

/**
 * @route   GET /api/dishes
 * @desc    Obtener todos los platos con filtros
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      tags,
      minCalories,
      maxCalories,
      difficulty,
      featured,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Construir filtro
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    if (minCalories || maxCalories) {
      filter['nutrition.calories'] = {};
      if (minCalories) filter['nutrition.calories'].$gte = Number(minCalories);
      if (maxCalories) filter['nutrition.calories'].$lte = Number(maxCalories);
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (featured) {
      filter.featured = featured === 'true';
    }

    // Calcular paginaciÃ³n
    const skip = (Number(page) - 1) * Number(limit);

    // Ejecutar query
    const dishes = await Dish.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Contar total para paginaciÃ³n
    const total = await Dish.countDocuments(filter);

    res.json({
      success: true,
      data: {
        dishes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener platos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener platos'
    });
  }
});

/**
 * @route   GET /api/dishes/featured
 * @desc    Obtener platos destacados
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const dishes = await Dish.find({ featured: true, isActive: true })
      .limit(6)
      .sort('-favorites');

    res.json({
      success: true,
      data: dishes
    });
  } catch (error) {
    console.error('Error al obtener platos destacados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener platos destacados'
    });
  }
});

/**
 * @route   GET /api/dishes/:id
 * @desc    Obtener un plato por ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        error: 'Plato no encontrado'
      });
    }

    // Incrementar contador de vistas
    await dish.incrementViews();

    res.json({
      success: true,
      data: dish
    });
  } catch (error) {
    console.error('Error al obtener plato:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Plato no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al obtener plato'
    });
  }
});

/**
 * @route   POST /api/dishes/:id/favorite
 * @desc    Agregar/quitar plato de favoritos
 * @access  Private
 */
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        error: 'Plato no encontrado'
      });
    }

    const user = await User.findById(req.user._id);

    // Verificar si ya estÃ¡ en favoritos
    const isFavorite = user.favorites.includes(dish._id);

    if (isFavorite) {
      // Quitar de favoritos
      user.favorites = user.favorites.filter(
        fav => fav.toString() !== dish._id.toString()
      );
      await dish.removeFavorite();
    } else {
      // Agregar a favoritos
      user.favorites.push(dish._id);
      await dish.addFavorite();
    }

    await user.save();

    res.json({
      success: true,
      data: {
        isFavorite: !isFavorite,
        favoritesCount: dish.favorites
      },
      message: isFavorite ? 'Quitado de favoritos' : 'Agregado a favoritos'
    });
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar favoritos'
    });
  }
});

/**
 * @route   GET /api/dishes/user/favorites
 * @desc    Obtener platos favoritos del usuario
 * @access  Private
 */
router.get('/user/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    });
  }
});

/**
 * @route   GET /api/dishes/categories/list
 * @desc    Obtener lista de categorÃ­as con conteo
 * @access  Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Dish.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorÃ­as:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorÃ­as'
    });
  }
});

module.exports = router;
