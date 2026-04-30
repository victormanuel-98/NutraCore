const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'user' };
    next();
  },
  optionalProtect: (req, res, next) => next()
}));

jest.mock('../../models/Review', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock('../../models/Recipe', () => ({
  findById: jest.fn()
}));

const Review = require('../../models/Review');
const Recipe = require('../../models/Recipe');
const reviewsRoutes = require('../../routes/reviews');

describe('reviews routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST / returns 404 when recipe does not exist', async () => {
    Recipe.findById.mockResolvedValue(null);
    const app = express();
    app.use(express.json());
    app.use('/api/reviews', reviewsRoutes);
    const res = await request(app).post('/api/reviews').send({ recipeId: '507f1f77bcf86cd799439011', rating: 4 });
    expect(res.status).toBe(404);
  });

  test('POST / creates review', async () => {
    Recipe.findById.mockResolvedValue({ _id: 'r1' });
    Review.findOne.mockResolvedValue(null);
    Review.create.mockResolvedValue({ _id: 'rev1', rating: 5 });
    const app = express();
    app.use(express.json());
    app.use('/api/reviews', reviewsRoutes);
    const res = await request(app).post('/api/reviews').send({ recipeId: '507f1f77bcf86cd799439011', rating: 5, comment: 'great' });
    expect(res.status).toBe(201);
  });

  test('GET /recipe/:id hides comment for guests', async () => {
    Review.find.mockReturnValue({
      populate: () => ({
        sort: async () => [{ toObject: () => ({ rating: 5, comment: 'secret' }) }]
      })
    });
    const app = express();
    app.use('/api/reviews', reviewsRoutes);
    const res = await request(app).get('/api/reviews/recipe/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body.data[0].comment).toBeUndefined();
  });
});
