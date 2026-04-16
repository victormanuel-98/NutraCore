/**
 * Rutas de Recetas
 * 
 * Endpoints para el NutraCore Lab - Creador de recetas
 */

const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/recipes
 * @desc    Obtener recetas del usuario
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const {
            category,
            search,
            isFavorite,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Construir filtro
        const filter = { user: req.user._id };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (isFavorite === 'true') {
            filter.isFavorite = true;
        }

        // Calcular paginación
        const skip = (Number(page) - 1) * Number(limit);

        // Ejecutar query
        const recipes = await Recipe.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // Contar total
        const total = await Recipe.countDocuments(filter);

        res.json({
            success: true,
            data: {
                recipes,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener recetas'
        });
    }
});

/**
 * @route   GET /api/recipes/:id
 * @desc    Obtener una receta por ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Receta no encontrada'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('Error al obtener receta:', error);

        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                error: 'Receta no encontrada'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al obtener receta'
        });
    }
});

/**
 * @route   POST /api/recipes
 * @desc    Crear nueva receta
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const {
            name,
            description,
            ingredients,
            servings,
            prepTime,
            category,
            notes,
            tags
        } = req.body;

        // Validar campos requeridos
        if (!name || !ingredients || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona nombre e ingredientes'
            });
        }

        // Crear receta
        const recipe = await Recipe.create({
            user: req.user._id,
            name,
            description,
            ingredients,
            servings: servings || 1,
            prepTime,
            category,
            notes,
            tags
        });

        res.status(201).json({
            success: true,
            data: recipe,
            message: 'Receta creada exitosamente'
        });
    } catch (error) {
        console.error('Error al crear receta:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al crear receta'
        });
    }
});

/**
 * @route   PUT /api/recipes/:id
 * @desc    Actualizar receta
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Receta no encontrada'
            });
        }

        const {
            name,
            description,
            ingredients,
            servings,
            prepTime,
            category,
            notes,
            tags,
            isFavorite
        } = req.body;

        // Actualizar campos
        if (name) recipe.name = name;
        if (description !== undefined) recipe.description = description;
        if (ingredients) recipe.ingredients = ingredients;
        if (servings) recipe.servings = servings;
        if (prepTime !== undefined) recipe.prepTime = prepTime;
        if (category) recipe.category = category;
        if (notes !== undefined) recipe.notes = notes;
        if (tags) recipe.tags = tags;
        if (isFavorite !== undefined) recipe.isFavorite = isFavorite;

        await recipe.save();

        res.json({
            success: true,
            data: recipe,
            message: 'Receta actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar receta:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al actualizar receta'
        });
    }
});

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Eliminar receta
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Receta no encontrada'
            });
        }

        await recipe.deleteOne();

        res.json({
            success: true,
            message: 'Receta eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar receta:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar receta'
        });
    }
});

/**
 * @route   POST /api/recipes/:id/favorite
 * @desc    Marcar/desmarcar receta como favorita
 * @access  Private
 */
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Receta no encontrada'
            });
        }

        recipe.isFavorite = !recipe.isFavorite;
        await recipe.save();

        res.json({
            success: true,
            data: {
                isFavorite: recipe.isFavorite
            },
            message: recipe.isFavorite ? 'Marcada como favorita' : 'Desmarcada como favorita'
        });
    } catch (error) {
        console.error('Error al toggle favorito:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar favorito'
        });
    }
});

/**
 * @route   GET /api/recipes/stats/summary
 * @desc    Obtener resumen estadístico de recetas del usuario
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user._id });

        const stats = {
            total: recipes.length,
            favorites: recipes.filter(r => r.isFavorite).length,
            byCategory: {},
            avgCaloriesPerServing: 0,
            totalCalories: 0
        };

        // Calcular estadísticas
        let totalCalories = 0;
        recipes.forEach(recipe => {
            // Por categoría
            stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;

            // Calorías
            totalCalories += recipe.totalNutrition.calories;
        });

        stats.totalCalories = totalCalories;
        stats.avgCaloriesPerServing = recipes.length > 0
            ? Math.round(totalCalories / recipes.length)
            : 0;

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
});

module.exports = router;
