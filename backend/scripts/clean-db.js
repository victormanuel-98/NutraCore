/* eslint-disable no-console */
require('dotenv').config({ path: `${__dirname}/../.env` });

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');

const uniqueObjectIds = (values = [], validIdsSet = null) => {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    if (!value) return;
    const id = value.toString();
    if (!id) return;
    if (validIdsSet && !validIdsSet.has(id)) return;
    if (seen.has(id)) return;
    seen.add(id);
    result.push(value);
  });

  return result;
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

const sanitizeStringArray = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : [];

async function main() {
  await connectDB();

  const summary = {
    usersUpdated: 0,
    usersFavoritesSynced: 0,
    recipesUpdated: 0,
    orphanReviewsDeleted: 0,
    reviewsUpdated: 0
  };

  try {
    const [users, recipes] = await Promise.all([
      User.find({}, '_id role gender isActive isEmailVerified avatar favorites favoriteRecipes savedNews preferences goals emailVerificationToken emailVerificationExpires age height weight').lean(),
      Recipe.find({}, '_id author favoritedBy favoritesCount nutrition ingredients steps tags commentsCount reviewsCount isPublished').lean()
    ]);

    const userIdSet = new Set(users.map((user) => user._id.toString()));
    const recipeIdSet = new Set(recipes.map((recipe) => recipe._id.toString()));

    const favoritesByUser = new Map();
    recipes.forEach((recipe) => {
      (recipe.favoritedBy || []).forEach((userId) => {
        const userKey = userId?.toString();
        if (!userKey || !userIdSet.has(userKey)) return;
        if (!favoritesByUser.has(userKey)) favoritesByUser.set(userKey, []);
        favoritesByUser.get(userKey).push(recipe._id);
      });
    });

    const userOps = [];
    users.forEach((user) => {
      const setPayload = {};
      const unsetPayload = {};

      if (!['user', 'admin'].includes(user.role)) setPayload.role = 'user';
      if (!['male', 'female', 'other', 'prefer-not-to-say'].includes(user.gender)) setPayload.gender = 'prefer-not-to-say';

      if (typeof user.isActive !== 'boolean') setPayload.isActive = true;
      if (typeof user.isEmailVerified !== 'boolean') setPayload.isEmailVerified = false;
      if (user.avatar === undefined) setPayload.avatar = null;

      // Keep these optional fields only when valid numbers.
      ['age', 'height', 'weight'].forEach((field) => {
        if (user[field] === undefined || user[field] === null) return;
        if (!Number.isFinite(Number(user[field]))) unsetPayload[field] = '';
      });

      const expectedGoals = {
        dailyCalories: toNonNegativeNumber(user.goals?.dailyCalories, 0),
        protein: toNonNegativeNumber(user.goals?.protein, 0),
        carbs: toNonNegativeNumber(user.goals?.carbs, 0),
        fats: toNonNegativeNumber(user.goals?.fats, 0),
        activityLevel: ['sedentary', 'light', 'moderate', 'active', 'very-active'].includes(user.goals?.activityLevel)
          ? user.goals.activityLevel
          : 'moderate',
        goal: ['lose-weight', 'maintain', 'gain-muscle', 'improve-health'].includes(user.goals?.goal)
          ? user.goals.goal
          : 'maintain'
      };

      if (Number.isFinite(Number(user.goals?.targetWeight)) && Number(user.goals.targetWeight) > 0) {
        expectedGoals.targetWeight = Number(user.goals.targetWeight);
      }
      setPayload.goals = expectedGoals;

      setPayload.preferences = {
        dietary: Array.isArray(user.preferences?.dietary) ? user.preferences.dietary : [],
        allergies: Array.isArray(user.preferences?.allergies) ? user.preferences.allergies : []
      };

      setPayload.favorites = uniqueObjectIds(user.favorites || []);
      setPayload.savedNews = uniqueObjectIds(user.savedNews || []);

      // Sync favoriteRecipes from Recipe.favoritedBy to keep one source of truth.
      const expectedFavoriteRecipes = uniqueObjectIds(
        favoritesByUser.get(user._id.toString()) || [],
        recipeIdSet
      );
      setPayload.favoriteRecipes = expectedFavoriteRecipes;

      if (user.isEmailVerified === true) {
        setPayload.emailVerificationToken = null;
        setPayload.emailVerificationExpires = null;
      }

      const hasSet = Object.keys(setPayload).length > 0;
      const hasUnset = Object.keys(unsetPayload).length > 0;
      if (!hasSet && !hasUnset) return;

      userOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: {
            ...(hasSet ? { $set: setPayload } : {}),
            ...(hasUnset ? { $unset: unsetPayload } : {})
          }
        }
      });

      summary.usersUpdated += 1;
      if (expectedFavoriteRecipes.length !== (user.favoriteRecipes || []).length) {
        summary.usersFavoritesSynced += 1;
      }
    });

    if (userOps.length > 0) {
      await User.bulkWrite(userOps, { ordered: false });
    }

    const recipeOps = [];
    recipes.forEach((recipe) => {
      const setPayload = {};

      const cleanFavoritedBy = uniqueObjectIds(recipe.favoritedBy || [], userIdSet);
      const expectedFavoritesCount = cleanFavoritedBy.length;

      const nutrition = {
        calories: toNonNegativeNumber(recipe.nutrition?.calories, 0),
        protein: toNonNegativeNumber(recipe.nutrition?.protein, 0),
        carbs: toNonNegativeNumber(recipe.nutrition?.carbs, 0),
        fats: toNonNegativeNumber(recipe.nutrition?.fats, 0)
      };

      const cleanIngredients = sanitizeStringArray(recipe.ingredients);
      const cleanSteps = sanitizeStringArray(recipe.steps);
      const cleanTags = sanitizeStringArray(recipe.tags);

      setPayload.favoritedBy = cleanFavoritedBy;
      setPayload.favoritesCount = expectedFavoritesCount;
      setPayload.nutrition = nutrition;
      setPayload.ingredients = cleanIngredients;
      setPayload.steps = cleanSteps;
      setPayload.tags = cleanTags;
      setPayload.commentsCount = toNonNegativeNumber(recipe.commentsCount, 0);
      setPayload.reviewsCount = toNonNegativeNumber(recipe.reviewsCount, 0);
      setPayload.isPublished = typeof recipe.isPublished === 'boolean' ? recipe.isPublished : true;

      recipeOps.push({
        updateOne: {
          filter: { _id: recipe._id },
          update: { $set: setPayload }
        }
      });
      summary.recipesUpdated += 1;
    });

    if (recipeOps.length > 0) {
      await Recipe.bulkWrite(recipeOps, { ordered: false });
    }

    const allReviewDocs = await Review.find({}, '_id user recipe rating comment').lean();
    const orphanReviewIds = [];
    const reviewOps = [];

    allReviewDocs.forEach((review) => {
      const userExists = userIdSet.has(review.user?.toString());
      const recipeExists = recipeIdSet.has(review.recipe?.toString());
      if (!userExists || !recipeExists) {
        orphanReviewIds.push(review._id);
        return;
      }

      const setPayload = {};
      const rating = Math.max(1, Math.min(5, toNonNegativeNumber(review.rating, 1)));
      if (rating !== review.rating) setPayload.rating = rating;
      if (typeof review.comment === 'string') setPayload.comment = review.comment.trim();

      if (Object.keys(setPayload).length > 0) {
        reviewOps.push({
          updateOne: {
            filter: { _id: review._id },
            update: { $set: setPayload }
          }
        });
      }
    });

    if (orphanReviewIds.length > 0) {
      const deleteResult = await Review.deleteMany({ _id: { $in: orphanReviewIds } });
      summary.orphanReviewsDeleted = deleteResult.deletedCount || 0;
    }

    if (reviewOps.length > 0) {
      await Review.bulkWrite(reviewOps, { ordered: false });
      summary.reviewsUpdated = reviewOps.length;
    }

    // Recalculate rating aggregates after normalization/deletes.
    for (const recipeId of recipeIdSet) {
      // eslint-disable-next-line no-await-in-loop
      await Review.calculateAverageRating(recipeId);
    }

    console.log('Limpieza completada:', JSON.stringify(summary, null, 2));
  } finally {
    await closeDB();
  }
}

main().catch((error) => {
  console.error('Error durante la limpieza de BD:', error);
  process.exitCode = 1;
});

