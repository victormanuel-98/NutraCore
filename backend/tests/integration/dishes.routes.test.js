const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'user' };
    next();
  }
}));

jest.mock('../../models/Dish', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../../models/User', () => ({
  findById: jest.fn()
}));

const Dish = require('../../models/Dish');
const User = require('../../models/User');
const dishesRoutes = require('../../routes/dishes');

describe('dishes routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET / returns list', async () => {
    Dish.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: async () => [{ _id: 'd1' }] }) }) });
    Dish.countDocuments.mockResolvedValue(1);
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes');
    expect(res.status).toBe(200);
    expect(res.body.data.dishes).toHaveLength(1);
  });

  test('GET /:id returns dish and increments views', async () => {
    Dish.findById.mockResolvedValue({ _id: 'd1', incrementViews: jest.fn().mockResolvedValue() });
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
  });

  test('POST /:id/favorite toggles favorite', async () => {
    Dish.findById.mockResolvedValue({ _id: 'd1', favorites: 2, addFavorite: jest.fn().mockResolvedValue() });
    User.findById.mockResolvedValue({ favorites: [], save: jest.fn().mockResolvedValue() });

    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).post('/api/dishes/507f1f77bcf86cd799439011/favorite');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /featured returns featured dishes', async () => {
    Dish.find.mockReturnValue({ limit: () => ({ sort: async () => [{ _id: 'd1' }] }) });
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes/featured');
    expect(res.status).toBe(200);
  });

  test('GET /categories/list returns categories', async () => {
    Dish.aggregate.mockResolvedValue([{ _id: 'breakfast', count: 3 }]);
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes/categories/list');
    expect(res.status).toBe(200);
    expect(res.body.data[0]._id).toBe('breakfast');
  });

  test('GET /user/favorites returns populated favorites', async () => {
    User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue({ favorites: [{ _id: 'd1' }] }) });
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes/user/favorites');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /:id returns 404 when dish does not exist', async () => {
    Dish.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('POST /:id/favorite returns 404 when dish missing', async () => {
    Dish.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).post('/api/dishes/507f1f77bcf86cd799439011/favorite');
    expect(res.status).toBe(404);
  });

  test('GET / returns 500 on unexpected error', async () => {
    Dish.find.mockImplementation(() => {
      throw new Error('db error');
    });
    const app = express();
    app.use('/api/dishes', dishesRoutes);
    const res = await request(app).get('/api/dishes');
    expect(res.status).toBe(500);
  });
});
