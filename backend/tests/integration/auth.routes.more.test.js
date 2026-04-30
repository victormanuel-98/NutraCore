const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  generateToken: jest.fn(() => 'token-123'),
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'user' };
    next();
  }
}));

jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: jest.fn()
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  exists: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const User = require('../../models/User');
const authRoutes = require('../../routes/auth');

describe('auth routes additional', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLIENT_URL = 'http://localhost:5173';
  });

  test('POST /register success', async () => {
    User.findOne.mockResolvedValue(null);
    User.exists.mockResolvedValue(false);
    User.create.mockResolvedValue({
      _id: 'u1',
      email: 'new@demo.com',
      name: 'NutraUser1234',
      toPublicProfile: () => ({ _id: 'u1', email: 'new@demo.com' })
    });
    User.updateOne.mockResolvedValue({ acknowledged: true });

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@demo.com',
      password: 'Password1!'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /register returns 400 for duplicated email', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@demo.com',
      password: 'Password1!'
    });
    expect(res.status).toBe(400);
  });

  test('POST /login success', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      toPublicProfile: () => ({ _id: 'u1', email: 'a@a.com' })
    });

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /login rejects non verified users', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      comparePassword: jest.fn().mockResolvedValue(true),
      toPublicProfile: () => ({ _id: 'u1' })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'Password1!' });
    expect(res.status).toBe(401);
  });

  test('POST /login rejects wrong password', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      comparePassword: jest.fn().mockResolvedValue(false),
      toPublicProfile: () => ({ _id: 'u1' })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('GET /verify-email should require token and email', async () => {
    const app = express();
    app.use('/api/auth', authRoutes);
    const res = await request(app).get('/api/auth/verify-email');
    expect(res.status).toBe(400);
  });

  test('GET /me should return user profile', async () => {
    const app = express();
    app.use('/api/auth', authRoutes);
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: undefined
    });
    const userDoc = { toPublicProfile: () => ({ _id: 'u1' }) };
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(userDoc)
      })
    });
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /resend-verification returns 404 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'none@x.com' });
    expect(res.status).toBe(404);
  });

  test('POST /resend-verification success path', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      email: 'u@u.com',
      name: 'User U',
      isEmailVerified: false
    });
    User.findByIdAndUpdate.mockResolvedValue({});
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'u@u.com' });
    expect(res.status).toBe(200);
  });

  test('GET /verify-email success path', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      isActive: true,
      save: jest.fn().mockResolvedValue(),
      toPublicProfile: () => ({ _id: 'u1' })
    });
    const app = express();
    app.use('/api/auth', authRoutes);
    const res = await request(app).get('/api/auth/verify-email?token=abc&email=a%40a.com');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /verify-email invalid token path', async () => {
    User.findOne.mockResolvedValue(null);
    const app = express();
    app.use('/api/auth', authRoutes);
    const res = await request(app).get('/api/auth/verify-email?token=abc&email=a%40a.com');
    expect(res.status).toBe(400);
  });

  test('PUT /change-password validates current password', async () => {
    User.findById.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false)
    });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).put('/api/auth/change-password').send({ currentPassword: 'a', newPassword: 'b' });
    expect(res.status).toBe(401);
  });

  test('PUT /change-password success path', async () => {
    User.findById.mockResolvedValue({
      tokenVersion: 0,
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(),
      _id: 'u1',
      role: 'user'
    });
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).put('/api/auth/change-password').send({ currentPassword: 'a', newPassword: 'c' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /logout returns success', async () => {
    const app = express();
    app.use('/api/auth', authRoutes);
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /change-password requires both passwords', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    const res = await request(app).put('/api/auth/change-password').send({ currentPassword: 'a' });
    expect(res.status).toBe(400);
  });
});
