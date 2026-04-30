const express = require('express');
const request = require('supertest');

jest.mock('../../services/openFoodFactsService', () => ({
  searchIngredients: jest.fn(),
  getIngredientNutritionProfile: jest.fn()
}));

const { searchIngredients, getIngredientNutritionProfile } = require('../../services/openFoodFactsService');
const ingredientsRoutes = require('../../routes/ingredients');

describe('ingredients routes', () => {
  test('GET /search returns 400 for short query', async () => {
    const app = express();
    app.use('/api/ingredients', ingredientsRoutes);
    const res = await request(app).get('/api/ingredients/search?q=a');
    expect(res.status).toBe(400);
  });

  test('GET /search returns results', async () => {
    searchIngredients.mockResolvedValue([{ id: 'en:apple', name: 'apple' }]);
    const app = express();
    app.use('/api/ingredients', ingredientsRoutes);
    const res = await request(app).get('/api/ingredients/search?q=ap');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /profile requires id or name', async () => {
    const app = express();
    app.use('/api/ingredients', ingredientsRoutes);
    const res = await request(app).get('/api/ingredients/profile');
    expect(res.status).toBe(400);
  });

  test('GET /profile returns 502 when provider fails', async () => {
    getIngredientNutritionProfile.mockRejectedValue(new Error('upstream'));
    const app = express();
    app.use('/api/ingredients', ingredientsRoutes);
    const res = await request(app).get('/api/ingredients/profile?name=apple');
    expect(res.status).toBe(502);
  });
});
