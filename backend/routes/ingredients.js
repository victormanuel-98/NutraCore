const express = require('express');
const { searchIngredients, getIngredientNutritionProfile } = require('../services/openFoodFactsService');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q = '', limit = '10' } = req.query;

    if (String(q).trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Debes indicar al menos 2 caracteres en el parámetro q'
      });
    }

    const results = await searchIngredients(q, limit);

    return res.json({
      success: true,
      data: results,
      meta: {
        query: String(q).trim(),
        count: results.length,
        source: 'open-food-facts'
      }
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: 'No se pudo obtener ingredientes desde Open Food Facts'
    });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const { id = '', name = '', nameEn = '', sampleSize = '25' } = req.query;

    if (!String(id).trim() && !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Debes indicar id o name para calcular la media nutricional'
      });
    }

    const profile = await getIngredientNutritionProfile({
      ingredientId: String(id).trim() || undefined,
      ingredientName: String(name).trim() || undefined,
      ingredientNameEn: String(nameEn).trim() || undefined,
      sampleSize
    });

    return res.json({
      success: true,
      data: profile
    });
  } catch {
    return res.status(502).json({
      success: false,
      error: 'No se pudo calcular la media nutricional del ingrediente'
    });
  }
});

module.exports = router;
