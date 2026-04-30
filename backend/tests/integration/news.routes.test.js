const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'user' };
    next();
  }
}));

jest.mock('../../models/News', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../../models/User', () => ({
  findById: jest.fn()
}));

const News = require('../../models/News');
const User = require('../../models/User');
const newsRoutes = require('../../routes/news');

describe('news routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET / should list news with pagination', async () => {
    News.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: async () => [{ _id: 'n1' }] }) }) });
    News.countDocuments.mockResolvedValue(1);
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    expect(res.body.data.news).toHaveLength(1);
  });

  test('GET /featured returns featured list', async () => {
    News.find.mockReturnValue({ limit: () => ({ sort: async () => [{ _id: 'n1' }] }) });
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news/featured');
    expect(res.status).toBe(200);
  });

  test('GET /:id returns 404 when not found', async () => {
    News.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('POST /:id/like increments likes', async () => {
    News.findById.mockResolvedValue({ likes: 7, addLike: jest.fn().mockResolvedValue() });
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).post('/api/news/507f1f77bcf86cd799439011/like');
    expect(res.status).toBe(200);
  });

  test('GET /user/saved returns user saved news', async () => {
    User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue({ savedNews: [{ _id: 'n1' }] }) });
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news/user/saved');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('POST /:id/share returns 404 when not found', async () => {
    News.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).post('/api/news/507f1f77bcf86cd799439011/share');
    expect(res.status).toBe(404);
  });

  test('POST /:id/save toggles saved state', async () => {
    News.findById.mockResolvedValue({
      _id: 'n1',
      saves: 2,
      addSave: jest.fn().mockResolvedValue(),
      removeSave: jest.fn().mockResolvedValue()
    });
    User.findById.mockResolvedValue({
      savedNews: [],
      save: jest.fn().mockResolvedValue()
    });
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).post('/api/news/507f1f77bcf86cd799439011/save');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /categories/list returns aggregated categories', async () => {
    News.aggregate.mockResolvedValue([{ _id: 'nutrition', count: 5 }]);
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news/categories/list');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET / handles internal error', async () => {
    News.find.mockImplementation(() => {
      throw new Error('db down');
    });
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(500);
  });

  test('POST /:id/like returns 404 when news missing', async () => {
    News.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/news', newsRoutes);
    const res = await request(app).post('/api/news/507f1f77bcf86cd799439011/like');
    expect(res.status).toBe(404);
  });
});
