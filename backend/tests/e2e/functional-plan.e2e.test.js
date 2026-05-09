const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockRejectedValue(new Error('SMTP unavailable in tests'))
}));

jest.mock('../../services/openFoodFactsService', () => ({
  searchIngredients: jest.fn().mockResolvedValue([{ id: 'mock-ingredient', nameEn: 'oats' }]),
  getIngredientNutritionProfile: jest.fn().mockResolvedValue({
    averageMacros: { calories: 389, proteins: 16.9, carbs: 66.3, fats: 6.9 }
  })
}));

const { createApp } = require('../../app');
const User = require('../../models/User');
const Recipe = require('../../models/Recipe');
const Review = require('../../models/Review');

describe('functional plan e2e', () => {
  let mongoServer;
  let app;

  const registerPayload = {
    email: 'qa-user@example.com',
    password: 'Password1!',
    age: 30,
    gender: 'male',
    height: 175,
    weight: 75
  };

  const createRecipeAs = async (token, overrides = {}) => {
    const payload = {
      title: 'Receta energia limpia',
      description: 'Descripcion suficientemente larga para la validacion de la receta',
      ingredients: ['Avena (100 g)'],
      steps: ['Mezcla todo y sirve'],
      category: 'desayuno',
      difficulty: 'facil',
      prepTime: 15,
      tags: ['rapido'],
      ...overrides
    };

    return request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.TRUST_PROXY = 'false';

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp({ mongooseRef: mongoose });
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), Recipe.deleteMany({}), Review.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('AUTH smoke and protected route behavior (AUTH-01/02/03/04)', async () => {
    const register = await request(app).post('/api/auth/register').send(registerPayload);
    expect(register.status).toBe(201);
    expect(register.body.success).toBe(true);

    const loginOk = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    expect(loginOk.status).toBe(200);
    expect(loginOk.body.data.token).toBeTruthy();

    const loginBad = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: 'wrong-password'
    });
    expect(loginBad.status).toBe(401);

    const protectedWithoutToken = await request(app).get('/api/users/profile');
    expect(protectedWithoutToken.status).toBe(401);
  });

  test('role checks and admin access (AUTH-05)', async () => {
    await User.create({
      email: 'admin@example.com',
      password: 'Password1!',
      name: 'Admin QA',
      role: 'admin',
      isEmailVerified: true
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password1!'
    });
    expect(adminLogin.status).toBe(200);

    const adminList = await request(app)
      .get('/api/users/admin/list')
      .set('Authorization', `Bearer ${adminLogin.body.data.token}`);
    expect(adminList.status).toBe(200);
    expect(adminList.body.success).toBe(true);
  });

  test('recipe lifecycle and business rules (REC-01/02/03/04/05/06 + SEC-01 + NUT-01)', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const login = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    const token = login.body.data.token;

    const missingFields = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(missingFields.status).toBe(400);

    const created = await createRecipeAs(token, { title: 'Receta mierda funcional' });
    expect(created.status).toBe(201);
    const recipeId = created.body.data._id;
    expect(created.body.data.title).toMatch(/\*+/);
    expect(created.body.data.nutrition.calories).toBeGreaterThan(0);

    const mine = await request(app)
      .get('/api/recipes/user/me')
      .set('Authorization', `Bearer ${token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data.length).toBe(1);

    const searched = await request(app).get('/api/recipes?search=funcional');
    expect(searched.status).toBe(200);
    expect(searched.body.data.length).toBe(1);

    const updated = await request(app)
      .put(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Receta actualizada',
        description: 'Descripcion actualizada suficientemente larga para pasar validacion',
        ingredients: ['Avena (100 g)'],
        steps: ['Paso de prueba'],
        category: 'desayuno',
        difficulty: 'facil',
        prepTime: 20,
        tags: ['rapido']
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe('Receta actualizada');

    const ownFavorite = await request(app)
      .post(`/api/recipes/${recipeId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect(ownFavorite.status).toBe(403);

    const deleted = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleted.status).toBe(200);

    const listAfterDelete = await request(app).get('/api/recipes');
    expect(listAfterDelete.status).toBe(200);
    expect(listAfterDelete.body.data.length).toBe(0);

    const recipeInDb = await Recipe.findById(recipeId).lean();
    expect(recipeInDb.isDeleted).toBe(true);
  });

  test('content limits are rejected instead of silently truncated (REC-07)', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const login = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    const token = login.body.data.token;

    const tooManyIngredients = Array.from({ length: 21 }, (_, index) => `Ingrediente ${index + 1} (10 g)`);
    const tooManyImages = Array.from(
      { length: 6 },
      (_, index) => `https://example.com/recipe-image-${index + 1}.jpg`
    );

    const overLimitRecipe = await createRecipeAs(token, {
      title: 'Receta con demasiados elementos',
      ingredients: tooManyIngredients,
      images: tooManyImages
    });

    expect(overLimitRecipe.status).toBe(400);
    expect(overLimitRecipe.body.error).toMatch(/validaci/i);
    expect(Array.isArray(overLimitRecipe.body.details)).toBe(true);
    expect(overLimitRecipe.body.details.join(' ')).toMatch(/ingredientes|imagenes/i);
  });

  test('reviews and profile updates (REV-01/REV-02 + USR-01/USR-02)', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const login = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    const token = login.body.data.token;

    const createdRecipe = await createRecipeAs(token);
    const recipeId = createdRecipe.body.data._id;

    const reviewOne = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, rating: 4, comment: 'Muy buena receta' });
    expect(reviewOne.status).toBe(201);

    const reviewTwo = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, rating: 5, comment: 'Actualizo mi opinion' });
    expect(reviewTwo.status).toBe(201);

    const reviews = await request(app)
      .get(`/api/reviews/recipe/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(reviews.status).toBe(200);
    expect(reviews.body.count).toBe(1);
    expect(reviews.body.data[0].rating).toBe(5);

    const profileUpdate = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 78 });
    expect(profileUpdate.status).toBe(200);
    expect(profileUpdate.body.data.weight).toBe(78);

    const stats = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.success).toBe(true);
  });
});
