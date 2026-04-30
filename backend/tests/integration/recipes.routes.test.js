const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'user' };
    next();
  },
  optionalProtect: (req, res, next) => next()
}));

jest.mock('../../services/openFoodFactsService', () => ({
  searchIngredients: jest.fn().mockResolvedValue([]),
  getIngredientNutritionProfile: jest.fn().mockResolvedValue({ averageMacros: null })
}));

jest.mock('../../services/auditService', () => ({
  logAuditEvent: jest.fn().mockResolvedValue()
}));

jest.mock('../../models/Recipe', () => {
  const Recipe = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn()
  };
  return {
    Recipe,
    RECIPE_CATEGORIES: ['desayuno', 'almuerzo/cena'],
    RECIPE_DIFFICULTIES: ['facil', 'media', 'dificil'],
    RECIPE_TAG_OPTIONS: ['rapido', 'facil']
  };
});

jest.mock('../../models/User', () => ({
  updateMany: jest.fn(),
  updateOne: jest.fn()
}));

const { Recipe } = require('../../models/Recipe');
const User = require('../../models/User');
const recipesRoutes = require('../../routes/recipes');

describe('recipes routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /tags/available returns tags', async () => {
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/tags/available');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET / should return paginated list', async () => {
    Recipe.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      })
    });
    Recipe.countDocuments.mockResolvedValue(0);
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET / returns 400 for invalid author filter', async () => {
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes?author=invalid-author');
    expect(res.status).toBe(400);
  });

  test('GET / returns 401 when favorites=true and no auth user', async () => {
    jest.resetModules();
    jest.doMock('../../config/auth', () => ({
      protect: (req, res, next) => {
        req.user = { _id: 'u1', role: 'user' };
        next();
      },
      optionalProtect: (req, res, next) => next()
    }));
    const anonymousRoutes = require('../../routes/recipes');
    const app = express();
    app.use('/api/recipes', anonymousRoutes);
    const res = await request(app).get('/api/recipes?favorites=true');
    expect(res.status).toBe(401);
  });

  test('GET /:id invalid object id returns 400', async () => {
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/not-valid-id');
    expect(res.status).toBe(400);
  });

  test('POST / returns 400 on validation errors', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).post('/api/recipes').send({
      title: '',
      description: '',
      ingredients: [],
      steps: []
    });
    expect(res.status).toBe(400);
  });

  test('POST / creates recipe successfully', async () => {
    Recipe.create.mockResolvedValue({ _id: 'r1' });
    Recipe.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'r1', title: 'Ok' })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).post('/api/recipes').send({
      title: 'Receta',
      description: 'Descripcion suficientemente larga',
      ingredients: ['Avena (100 g)'],
      steps: ['Paso 1'],
      category: 'desayuno',
      difficulty: 'facil',
      prepTime: 10,
      tags: ['rapido']
    });
    expect(res.status).toBe(201);
  });

  test('POST /:id/favorite blocks own recipe', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u1' },
      favoritedBy: []
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).post('/api/recipes/507f1f77bcf86cd799439011/favorite');
    expect(res.status).toBe(403);
  });

  test('PATCH /:id/restore forbidden for non-admin', async () => {
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).patch('/api/recipes/507f1f77bcf86cd799439011/restore');
    expect(res.status).toBe(403);
  });

  test('GET /featured/popular returns data', async () => {
    Recipe.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/featured/popular');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /user/me returns own recipes', async () => {
    Recipe.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      })
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/user/me');
    expect(res.status).toBe(200);
  });

  test('GET /user/favorites returns favorites list', async () => {
    Recipe.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      })
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/user/favorites');
    expect(res.status).toBe(200);
  });

  test('POST /:id/favorite toggles when recipe belongs to another user', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u2' },
      favoritedBy: [],
      save: jest.fn().mockResolvedValue(),
      favoritesCount: 0
    });
    User.updateOne.mockResolvedValue({});
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).post('/api/recipes/507f1f77bcf86cd799439011/favorite');
    expect(res.status).toBe(200);
  });

  test('POST /:id/favorite removes favorite when already exists', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u2' },
      favoritedBy: [{ toString: () => 'u1' }],
      save: jest.fn().mockResolvedValue(),
      favoritesCount: 1
    });
    User.updateOne.mockResolvedValue({});
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).post('/api/recipes/507f1f77bcf86cd799439011/favorite');
    expect(res.status).toBe(200);
    expect(res.body.data.isFavorite).toBe(false);
  });

  test('DELETE /:id returns 404 when recipe does not exist', async () => {
    Recipe.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).delete('/api/recipes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('GET /:id returns 404 when recipe is deleted', async () => {
    Recipe.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ isDeleted: true })
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('GET /:id returns recipe when found', async () => {
    Recipe.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'r1',
        isDeleted: false,
        ingredients: ['Avena (100 g)'],
        nutrition: { calories: 10, protein: 1, carbs: 2, fats: 1 }
      })
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).get('/api/recipes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
  });

  test('PUT /:id returns 403 for non owner', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u2' }
    });
    const app = express();
    app.use(express.json());
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).put('/api/recipes/507f1f77bcf86cd799439011').send({ title: 'x' });
    expect(res.status).toBe(403);
  });

  test('PUT /:id updates recipe successfully for owner', async () => {
    const recipeDoc = {
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u1' },
      toObject: () => ({
        title: 'old',
        description: 'descripcion larga',
        ingredients: ['Avena (100 g)'],
        steps: ['Paso 1'],
        category: 'desayuno',
        difficulty: 'facil',
        prepTime: 10,
        nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        images: [],
        tags: ['rapido']
      }),
      save: jest.fn().mockResolvedValue()
    };
    Recipe.findById
      .mockResolvedValueOnce(recipeDoc)
      .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'r1', title: 'new' }) });

    const app = express();
    app.use(express.json());
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).put('/api/recipes/507f1f77bcf86cd799439011').send({
      title: 'nuevo',
      description: 'descripcion actualizada suficientemente larga',
      ingredients: ['Avena (100 g)'],
      steps: ['Paso 1'],
      category: 'desayuno',
      difficulty: 'facil',
      prepTime: 12,
      tags: ['rapido']
    });
    expect(res.status).toBe(200);
  });

  test('PUT /:id returns 404 when recipe is deleted', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: true,
      author: { toString: () => 'u1' }
    });
    const app = express();
    app.use(express.json());
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).put('/api/recipes/507f1f77bcf86cd799439011').send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('DELETE /:id returns 403 for non owner', async () => {
    Recipe.findById.mockResolvedValue({
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u2' }
    });
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).delete('/api/recipes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(403);
  });

  test('DELETE /:id soft deletes for owner', async () => {
    const recipeDoc = {
      _id: 'r1',
      isDeleted: false,
      author: { toString: () => 'u1' },
      save: jest.fn().mockResolvedValue()
    };
    Recipe.findById.mockResolvedValue(recipeDoc);
    Recipe.updateMany.mockResolvedValue({});
    User.updateMany.mockResolvedValue({});
    const app = express();
    app.use('/api/recipes', recipesRoutes);
    const res = await request(app).delete('/api/recipes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
  });

  test('PATCH /:id/restore returns 404 when recipe missing', async () => {
    jest.resetModules();
    jest.doMock('../../config/auth', () => ({
      protect: (req, res, next) => {
        req.user = { _id: 'a1', role: 'admin' };
        next();
      },
      optionalProtect: (req, res, next) => next()
    }));
    const adminRoutes = require('../../routes/recipes');
    Recipe.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/recipes', adminRoutes);
    const res = await request(app).patch('/api/recipes/507f1f77bcf86cd799439011/restore');
    expect(res.status).toBe(404);
  });

});
