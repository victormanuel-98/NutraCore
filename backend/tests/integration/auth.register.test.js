const express = require('express');
const request = require('supertest');

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  exists: jest.fn()
}));

jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: jest.fn()
}));

const User = require('../../models/User');
const authRoutes = require('../../routes/auth');

describe('auth route integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /register should validate required fields', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /register should reject duplicated email', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing-user' });

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'Password1!'
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/registrado/i);
  });
});
