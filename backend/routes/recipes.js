const express = require('express');
const mongoose = require('mongoose');
const { Recipe, RECIPE_CATEGORIES, RECIPE_DIFFICULTIES, RECIPE_TAG_OPTIONS } = require('../models/Recipe');
const User = require('../models/User');
const { protect, optionalProtect } = require('../config/auth');
const { searchIngredients, getIngredientNutritionProfile } = require('../services/openFoodFactsService');
const { logAuditEvent } = require('../services/auditService');
const { validateObjectIdParam } = require('../middleware/validation');
const { sendError: sendHttpError } = require('../utils/http');

const router = express.Router();
const MAX_LIMIT = 12;
const MAX_INGREDIENTS_FOR_NUTRITION = 25;
const RECIPES_CACHE_TTL_MS = Math.max(5_000, Number(process.env.RECIPES_CACHE_TTL_MS) || 60_000);
const recipesCache = new Map();
const UNIT_TO_GRAMS = {
  g: 1,
  gr: 1,
  gramo: 1,
  gramos: 1,
  kg: 1000,
  kilo: 1000,
  kilos: 1000,
  ml: 1,
  taza: 240,
  tazas: 240,
  cda: 15,
  cucharada: 15,
  cucharadas: 15,
  cdta: 5,
  cucharadita: 5,
  cucharaditas: 5,
  unidad: 100,
  unidades: 100,
  u: 100
};

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

const normalizeTag = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const roundTo = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRecipesCacheKey = ({ route = 'list', query = {} }) => {
  const ordered = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {});
  return `${route}:${JSON.stringify(ordered)}`;
};

const getCacheEntry = (key) => {
  const cached = recipesCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    recipesCache.delete(key);
    return null;
  }
  return cached.value;
};

const setCacheEntry = (key, value, ttlMs = RECIPES_CACHE_TTL_MS) => {
  recipesCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
};

const clearRecipesCache = () => {
  recipesCache.clear();
};

const canUseListCache = (req, { sort, page, limit, category, difficulty, search, author, favorites }) => {
  if (req.user?._id) return false;
  if (favorites === 'true') return false;
  if (author || search) return false;
  if (category) return false;
  if (difficulty) return false;

  const safeSort = String(sort || 'recent');
  const safePage = Math.max(1, toNumber(page, 1));
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, toNumber(limit, 12)));
  return (safeSort === 'recent' || safeSort === 'popular') && safePage <= 3 && safeLimit <= 12;
};

const parseIngredientLine = (line) => {
  const raw = String(line || '').trim();
  if (!raw) return null;

  const match = raw.match(/^(.*?)(?:\s*\(([\d.,]+)\s*([^)]+)\))?$/);
  const name = String(match?.[1] || raw).trim();
  const quantityRaw = String(match?.[2] || '100').replace(',', '.');
  const quantity = toNumber(quantityRaw, 100);
  const unitRaw = String(match?.[3] || 'g')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');
  const gramsFactor = UNIT_TO_GRAMS[unitRaw] || UNIT_TO_GRAMS.g;
  const grams = Math.max(0, quantity) * gramsFactor;

  if (!name) return null;

  return {
    name,
    grams: grams > 0 ? grams : 100
  };
};

const calculateNutritionFromIngredients = async (ingredients = []) => {
  const parsed = ingredients
    .map(parseIngredientLine)
    .filter(Boolean)
    .slice(0, MAX_INGREDIENTS_FOR_NUTRITION);

  if (parsed.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0 };
  }

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  };

  const results = await Promise.all(
    parsed.map(async (item) => {
      try {
        const suggestions = await searchIngredients(item.name, 1);
        const suggestion = Array.isArray(suggestions) && suggestions.length > 0 ? suggestions[0] : null;
        const profile = await getIngredientNutritionProfile({
          ingredientId: suggestion?.id,
          ingredientName: item.name,
          ingredientNameEn: suggestion?.nameEn,
          sampleSize: 25
        });

        return { item, profile };
      } catch {
        return { item, profile: null };
      }
    })
  );

  results.forEach(({ item, profile }) => {
    const macros = profile?.averageMacros;
    if (!macros) return;

    const multiplier = item.grams / 100;
    totals.calories += toNumber(macros.calories, 0) * multiplier;
    totals.protein += toNumber(macros.proteins, 0) * multiplier;
    totals.carbs += toNumber(macros.carbs, 0) * multiplier;
    totals.fats += toNumber(macros.fats, 0) * multiplier;
  });

  return {
    calories: Math.round(totals.calories),
    protein: roundTo(totals.protein, 1),
    carbs: roundTo(totals.carbs, 1),
    fats: roundTo(totals.fats, 1)
  };
};

const normalizeRecipePayload = (payload = {}) => {
  const normalizedTags = Array.from(
    new Set(
      normalizeStringArray(payload.tags)
        .map(normalizeTag)
        .filter(Boolean)
    )
  );

  return {
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
    tags: normalizedTags
  };
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
      if (payload.images.length > 5) errors.push('Puedes subir un máximo de 5 imágenes');
    }
  }
  if (payload.tags !== undefined) {
    if (!Array.isArray(payload.tags)) {
      errors.push('Los tags deben enviarse como un array');
    } else {
      if (payload.tags.length > 3) errors.push('Puedes asignar un máximo de 3 tags por receta');
      const hasInvalidTag = payload.tags.some((tag) => !RECIPE_TAG_OPTIONS.includes(tag));
      if (hasInvalidTag) {
        errors.push(`Los tags permitidos son: ${RECIPE_TAG_OPTIONS.join(', ')}`);
      }
    }
  }
  return errors;
};

const isAdminUser = (user) => Boolean(user && (user.role === 'admin' || user.isAdmin === true));

const canEditRecipe = (recipe, user) => {
  if (!recipe || !user) return false;
  return recipe.author.toString() === user._id.toString();
};

const canDeleteRecipe = (recipe, user) => {
  if (!recipe || !user) return false;
  return recipe.author.toString() === user._id.toString() || isAdminUser(user);
};

const mapCodeByStatus = (status) => {
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  return 'REQUEST_ERROR';
};

const sendError = (res, status, message, details, code = mapCodeByStatus(status)) =>
  sendHttpError(res, status, code, message, details);

const isNutritionEmpty = (nutrition = {}) => {
  const calories = toNumber(nutrition?.calories, 0);
  const protein = toNumber(nutrition?.protein, 0);
  const carbs = toNumber(nutrition?.carbs, 0);
  const fats = toNumber(nutrition?.fats, 0);
  return calories === 0 && protein === 0 && carbs === 0 && fats === 0;
};

const ensureRecipeNutrition = async (recipe) => {
  if (!recipe || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return recipe;
  if (!isNutritionEmpty(recipe.nutrition)) return recipe;

  const calculatedNutrition = await calculateNutritionFromIngredients(recipe.ingredients);
  recipe.nutrition = calculatedNutrition;
  await recipe.save();

  return recipe;
};

router.get('/', optionalProtect, async (req, res) => {
  try {
    const { category, difficulty, search, author, favorites, page = '1', limit = '12', sort = 'recent' } = req.query;
    const useCache = canUseListCache(req, { sort, page, limit, category, difficulty, search, author, favorites });
    const cacheKey = useCache
      ? buildRecipesCacheKey({ route: 'list', query: { category, difficulty, page, limit, sort } })
      : null;

    if (cacheKey) {
      const cachedResponse = getCacheEntry(cacheKey);
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
    }

    const currentPage = Math.max(1, toNumber(page, 1));
    const pageLimit = Math.min(MAX_LIMIT, Math.max(1, toNumber(limit, 12)));
    const filter = { isPublished: true, isDeleted: { $ne: true } };

    if (category) filter.category = String(category).trim().toLowerCase();
    if (difficulty) filter.difficulty = String(difficulty).trim().toLowerCase();

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return sendError(res, 400, 'El autor indicado no es válido');
      }
      filter.author = author;
    }

    if (search) {
      const safeSearch = escapeRegex(String(search).trim().slice(0, 80));
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

    const [rawItems, total] = await Promise.all([
      Recipe.find(filter)
        .populate('author', 'name avatar')
        .sort(sortConfig)
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit),
      Recipe.countDocuments(filter)
    ]);
    const items = await Promise.all(rawItems.map((recipe) => ensureRecipeNutrition(recipe)));

    const responsePayload = {
      success: true,
      data: items,
      meta: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit)
      }
    };

    if (cacheKey) setCacheEntry(cacheKey, responsePayload);

    return res.json(responsePayload);
  } catch {
    return sendError(res, 500, 'No se pudieron obtener las recetas');
  }
});

router.get('/user/me', protect, async (req, res) => {
  try {
    const rawRecipes = await Recipe.find({ author: req.user._id, isDeleted: { $ne: true } })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    const recipes = await Promise.all(rawRecipes.map((recipe) => ensureRecipeNutrition(recipe)));

    return res.json({ success: true, data: recipes });
  } catch {
    return sendError(res, 500, 'No se pudieron obtener tus recetas');
  }
});

router.get('/user/favorites', protect, async (req, res) => {
  try {
    const rawRecipes = await Recipe.find({ favoritedBy: req.user._id, isPublished: true, isDeleted: { $ne: true } })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    const recipes = await Promise.all(rawRecipes.map((recipe) => ensureRecipeNutrition(recipe)));

    return res.json({ success: true, data: recipes });
  } catch {
    return sendError(res, 500, 'No se pudieron obtener tus recetas favoritas');
  }
});

router.get('/featured/popular', async (req, res) => {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, toNumber(req.query.limit, 6)));
    const cacheKey = buildRecipesCacheKey({ route: 'featured-popular', query: { limit } });
    const cachedResponse = getCacheEntry(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const rawRecipes = await Recipe.find({ isPublished: true, isDeleted: { $ne: true } })
      .populate('author', 'name avatar')
      .sort({ favoritesCount: -1, createdAt: -1 })
      .limit(limit);
    const recipes = await Promise.all(rawRecipes.map((recipe) => ensureRecipeNutrition(recipe)));

    const responsePayload = { success: true, data: recipes };
    setCacheEntry(cacheKey, responsePayload);

    return res.json(responsePayload);
  } catch {
    return sendError(res, 500, 'No se pudieron obtener las recetas destacadas');
  }
});

router.get('/tags/available', (_req, res) => {
  return res.json({
    success: true,
    data: RECIPE_TAG_OPTIONS
  });
});

router.get('/:id', validateObjectIdParam('id'), optionalProtect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name avatar');
    if (!recipe || recipe.isDeleted) return sendError(res, 404, 'Receta no encontrada');
    const hydratedRecipe = await ensureRecipeNutrition(recipe);
    return res.json({ success: true, data: hydratedRecipe });
  } catch (error) {
    if (error.name === 'CastError') return sendError(res, 404, 'Receta no encontrada');
    return sendError(res, 500, 'No se pudo obtener la receta');
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const normalized = normalizeRecipePayload(req.body);
    normalized.nutrition = await calculateNutritionFromIngredients(normalized.ingredients);
    const validationErrors = validateRecipePayload(normalized);

    if (validationErrors.length > 0) {
      return sendError(res, 400, 'Error de validación', validationErrors);
    }

    const recipe = await Recipe.create({ ...normalized, author: req.user._id });
    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'name avatar');
    clearRecipesCache();

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
});

router.put('/:id', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || recipe.isDeleted) return sendError(res, 404, 'Receta no encontrada');

    if (!canEditRecipe(recipe, req.user)) {
      return sendError(res, 403, 'No tienes permisos para editar esta receta');
    }

    const normalized = normalizeRecipePayload({ ...recipe.toObject(), ...req.body });
    normalized.nutrition = await calculateNutritionFromIngredients(normalized.ingredients);
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
    clearRecipesCache();
    await logAuditEvent({
      req,
      actor: req.user,
      action: 'recipe.update',
      targetType: 'Recipe',
      targetId: recipe._id
    });

    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'name avatar');

    return res.json({
      success: true,
      data: populatedRecipe,
      message: 'Receta actualizada correctamente'
    });
  } catch (error) {
    if (error.name === 'CastError') return sendError(res, 404, 'Receta no encontrada');
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
});

router.delete('/:id', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || recipe.isDeleted) return sendError(res, 404, 'Receta no encontrada');

    if (!canDeleteRecipe(recipe, req.user)) {
      return sendError(res, 403, 'No tienes permisos para eliminar esta receta');
    }

    recipe.isDeleted = true;
    recipe.deletedAt = new Date();
    recipe.deletedBy = req.user._id;
    recipe.isPublished = false;
    await recipe.save();

    await User.updateMany({}, { $pull: { favoriteRecipes: recipe._id } });
    await Recipe.updateMany({ _id: recipe._id }, { $set: { favoritedBy: [], favoritesCount: 0 } });
    clearRecipesCache();

    await logAuditEvent({
      req,
      actor: req.user,
      action: 'recipe.delete.soft',
      targetType: 'Recipe',
      targetId: recipe._id
    });

    return res.json({ success: true, message: 'Receta eliminada correctamente (soft-delete)' });
  } catch (error) {
    if (error.name === 'CastError') return sendError(res, 404, 'Receta no encontrada');
    return sendError(res, 500, 'No se pudo eliminar la receta');
  }
});

router.post('/:id/favorite', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || recipe.isDeleted) return sendError(res, 404, 'Receta no encontrada');

    if (recipe.author.toString() === req.user._id.toString()) {
      return sendError(res, 403, 'No puedes dar me gusta ni guardar en favoritos tu propia receta');
    }

    const userId = req.user._id.toString();
    const exists = recipe.favoritedBy.some((id) => id.toString() === userId);

    if (exists) {
      recipe.favoritedBy = recipe.favoritedBy.filter((id) => id.toString() !== userId);
    } else {
      recipe.favoritedBy.push(req.user._id);
    }

    recipe.favoritesCount = recipe.favoritedBy.length;
    await Promise.all([
      recipe.save(),
      exists
        ? User.updateOne({ _id: req.user._id }, { $pull: { favoriteRecipes: recipe._id } })
        : User.updateOne({ _id: req.user._id }, { $addToSet: { favoriteRecipes: recipe._id } })
    ]);
    clearRecipesCache();

    return res.json({
      success: true,
      data: {
        isFavorite: !exists,
        favoritesCount: recipe.favoritesCount
      },
      message: !exists ? 'Receta añadida a favoritos' : 'Receta eliminada de favoritos'
    });
  } catch (error) {
    if (error.name === 'CastError') return sendError(res, 404, 'Receta no encontrada');
    return sendError(res, 500, 'No se pudo actualizar el favorito');
  }
});

router.patch('/:id/restore', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    if (!isAdminUser(req.user)) return sendError(res, 403, 'Solo admin puede restaurar recetas');

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return sendError(res, 404, 'Receta no encontrada');
    if (!recipe.isDeleted) return sendError(res, 400, 'La receta no está eliminada');

    recipe.isDeleted = false;
    recipe.deletedAt = null;
    recipe.deletedBy = null;
    recipe.isPublished = true;
    await recipe.save();
    clearRecipesCache();

    await logAuditEvent({
      req,
      actor: req.user,
      action: 'recipe.restore',
      targetType: 'Recipe',
      targetId: recipe._id
    });

    return res.json({ success: true, message: 'Receta restaurada correctamente' });
  } catch {
    return sendError(res, 500, 'No se pudo restaurar la receta');
  }
});

module.exports = router;

