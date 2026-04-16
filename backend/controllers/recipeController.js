const mongoose = require('mongoose');
const { Recipe, RECIPE_CATEGORIES, RECIPE_DIFFICULTIES, DATA_URL_REGEX } = require('../models/Recipe');

const MAX_LIMIT = 50;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const normalizeRecipePayload = (payload = {}) => {
  const normalized = {
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    description: typeof payload.description === 'string' ? payload.description.trim() : '',
    ingredients: normalizeStringArray(payload.ingredients),
    steps: normalizeStringArray(payload.steps),
    category: typeof payload.category === 'string' ? payload.category.trim().toLowerCase() : '',
    images: Array.isArray(payload.images) ? payload.images.filter((img) => typeof img === 'string' && img.trim()) : [],
    prepTime: toNumber(payload.prepTime),
    difficulty: typeof payload.difficulty === 'string' ? payload.difficulty.trim().toLowerCase() : '',
    nutrition: {
      calories: toNumber(payload.nutrition?.calories),
      protein: toNumber(payload.nutrition?.protein),
      carbs: toNumber(payload.nutrition?.carbs),
      fats: toNumber(payload.nutrition?.fats)
    },
    tags: normalizeStringArray(payload.tags)
  };

  return normalized;
};

const validateRecipePayload = (payload, { partial = false } = {}) => {
  const errors = [];

  if (!partial || payload.title !== undefined) {
    if (!payload.title) errors.push('El título es obligatorio');
  }

  if (!partial || payload.description !== undefined) {
    if (!payload.description) errors.push('La descripción es obligatoria');
  }

  if (!partial || payload.ingredients !== undefined) {
    if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
      errors.push('Debes incluir al menos un ingrediente');
    }
  }

  if (!partial || payload.steps !== undefined) {
    if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
      errors.push('Debes incluir al menos un paso');
    }
  }

  if (!partial || payload.category !== undefined) {
    if (!RECIPE_CATEGORIES.includes(payload.category)) {
      errors.push(`La categoría debe ser una de: ${RECIPE_CATEGORIES.join(', ')}`);
    }
  }

  if (!partial || payload.difficulty !== undefined) {
    if (!RECIPE_DIFFICULTIES.includes(payload.difficulty)) {
      errors.push(`La dificultad debe ser una de: ${RECIPE_DIFFICULTIES.join(', ')}`);
    }
  }

  if (!partial || payload.prepTime !== undefined) {
    if (!Number.isFinite(payload.prepTime) || payload.prepTime < 1) {
      errors.push('El tiempo de preparación debe ser un número mayor que 0');
    }
  }

  if (payload.images !== undefined) {
    if (!Array.isArray(payload.images)) {
      errors.push('Las imágenes deben enviarse como un array');
    } else {
      if (payload.images.length > 5) {
        errors.push('Puedes subir un máximo de 5 imágenes');
      }

      const invalidImage = payload.images.some((image) => !DATA_URL_REGEX.test(image));
      if (invalidImage) {
        errors.push('Las imágenes deben estar en formato Data URL base64 válido');
      }
    }
  }

  return errors;
};

const isAdminUser = (user) => {
  if (!user) return false;
  return user.role === 'admin' || user.isAdmin === true;
};

const canManageRecipe = (recipe, user) => {
  if (!recipe || !user) return false;
  return recipe.author.toString() === user._id.toString() || isAdminUser(user);
};

const sendError = (res, status, message, details) => {
  res.status(status).json({
    success: false,
    error: message,
    ...(details ? { details } : {})
  });
};

const createRecipe = async (req, res) => {
  try {
    const normalized = normalizeRecipePayload(req.body);
    const validationErrors = validateRecipePayload(normalized);

    if (validationErrors.length > 0) {
      return sendError(res, 400, 'Error de validación', validationErrors);
    }

    const recipe = await Recipe.create({
      ...normalized,
      author: req.user._id
    });

    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'name avatar');

    return res.status(201).json({
      success: true,
      data: populatedRecipe,
      message: 'Receta publicada correctamente'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(
        res,
        400,
        'Error de validación',
        Object.values(error.errors).map((item) => item.message)
      );
    }

    return sendError(res, 500, 'No se pudo crear la receta');
  }
};

const getRecipes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      author,
      favorites,
      page = '1',
      limit = '12',
      sort = 'recent'
    } = req.query;

    const currentPage = Math.max(1, toNumber(page, 1));
    const pageLimit = Math.min(MAX_LIMIT, Math.max(1, toNumber(limit, 12)));

    const filter = { isPublished: true };

    if (category) {
      filter.category = String(category).trim().toLowerCase();
    }

    if (difficulty) {
      filter.difficulty = String(difficulty).trim().toLowerCase();
    }

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return sendError(res, 400, 'El autor indicado no es válido');
      }
      filter.author = author;
    }

    if (search) {
      const safeSearch = String(search).trim();
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    if (favorites === 'true') {
      if (!req.user?._id) {
        return sendError(res, 401, 'Debes iniciar sesión para filtrar por favoritos');
      }
      filter.favoritedBy = req.user._id;
    }

    const sortMap = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { favoritesCount: -1, createdAt: -1 },
      prepTimeAsc: { prepTime: 1, createdAt: -1 },
      prepTimeDesc: { prepTime: -1, createdAt: -1 }
    };

    const sortConfig = sortMap[String(sort)] || sortMap.recent;

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .populate('author', 'name avatar')
        .sort(sortConfig)
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit),
      Recipe.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    return sendError(res, 500, 'No se pudieron obtener las recetas');
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name avatar');

    if (!recipe) {
      return sendError(res, 404, 'Receta no encontrada');
    }

    return res.json({ success: true, data: recipe });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 404, 'Receta no encontrada');
    }
    return sendError(res, 500, 'No se pudo obtener la receta');
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return sendError(res, 404, 'Receta no encontrada');
    }

    if (!canManageRecipe(recipe, req.user)) {
      return sendError(res, 403, 'No tienes permisos para editar esta receta');
    }

    const normalized = normalizeRecipePayload({ ...recipe.toObject(), ...req.body });
    const validationErrors = validateRecipePayload(normalized, { partial: false });

    if (validationErrors.length > 0) {
      return sendError(res, 400, 'Error de validación', validationErrors);
    }

    recipe.title = normalized.title;
    recipe.description = normalized.description;
    recipe.ingredients = normalized.ingredients;
    recipe.steps = normalized.steps;
    recipe.category = normalized.category;
    recipe.images = normalized.images;
    recipe.prepTime = normalized.prepTime;
    recipe.difficulty = normalized.difficulty;
    recipe.nutrition = normalized.nutrition;
    recipe.tags = normalized.tags;

    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'name avatar');

    return res.json({
      success: true,
      data: populatedRecipe,
      message: 'Receta actualizada correctamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 404, 'Receta no encontrada');
    }

    if (error.name === 'ValidationError') {
      return sendError(
        res,
        400,
        'Error de validación',
        Object.values(error.errors).map((item) => item.message)
      );
    }

    return sendError(res, 500, 'No se pudo actualizar la receta');
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return sendError(res, 404, 'Receta no encontrada');
    }

    if (!canManageRecipe(recipe, req.user)) {
      return sendError(res, 403, 'No tienes permisos para eliminar esta receta');
    }

    await recipe.deleteOne();

    return res.json({
      success: true,
      message: 'Receta eliminada correctamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 404, 'Receta no encontrada');
    }

    return sendError(res, 500, 'No se pudo eliminar la receta');
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return sendError(res, 404, 'Receta no encontrada');
    }

    const userId = req.user._id.toString();
    const exists = recipe.favoritedBy.some((id) => id.toString() === userId);

    if (exists) {
      recipe.favoritedBy = recipe.favoritedBy.filter((id) => id.toString() !== userId);
    } else {
      recipe.favoritedBy.push(req.user._id);
    }

    recipe.favoritesCount = recipe.favoritedBy.length;
    await recipe.save();

    return res.json({
      success: true,
      data: {
        isFavorite: !exists,
        favoritesCount: recipe.favoritesCount
      },
      message: !exists ? 'Receta añadida a favoritos' : 'Receta eliminada de favoritos'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 404, 'Receta no encontrada');
    }

    return sendError(res, 500, 'No se pudo actualizar el favorito');
  }
};

const getMyRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    return sendError(res, 500, 'No se pudieron obtener tus recetas');
  }
};

const getPopularRecipes = async (req, res) => {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, toNumber(req.query.limit, 6)));

    const recipes = await Recipe.find({ isPublished: true })
      .populate('author', 'name avatar')
      .sort({ favoritesCount: -1, createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    return sendError(res, 500, 'No se pudieron obtener las recetas destacadas');
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getMyRecipes,
  getPopularRecipes
};
