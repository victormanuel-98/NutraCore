const express = require('express');
const request = require('supertest');

jest.mock('../../config/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'u1', role: 'admin' };
    next();
  },
  requireAdmin: (req, res, next) => next()
}));

jest.mock('../../services/auditService', () => ({
  logAuditEvent: jest.fn().mockResolvedValue()
}));

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  updateMany: jest.fn()
}));

jest.mock('../../models/Recipe', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  updateMany: jest.fn()
}));

jest.mock('../../models/Review', () => ({
  countDocuments: jest.fn(),
  deleteMany: jest.fn()
}));

jest.mock('../../models/AuditLog', () => ({
  find: jest.fn()
}));

jest.mock('../../models/MenuConsumption', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn()
}));

const User = require('../../models/User');
const Recipe = require('../../models/Recipe');
const Review = require('../../models/Review');
const AuditLog = require('../../models/AuditLog');
const MenuConsumption = require('../../models/MenuConsumption');
const usersRoutes = require('../../routes/users');

describe('users routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /profile returns profile data', async () => {
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          calculateBMI: () => '24.0',
          toPublicProfile: () => ({ _id: 'u1' })
        })
      })
    });
    Recipe.countDocuments.mockResolvedValue(2);
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /profile handles internal error', async () => {
    User.findById.mockImplementation(() => {
      throw new Error('db');
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(500);
  });

  test('GET /admin/list returns users list', async () => {
    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: 'u1', toPublicProfile: () => ({ _id: 'u1' }) }
        ])
      })
    });
    Recipe.countDocuments.mockResolvedValue(0);
    Review.countDocuments.mockResolvedValue(0);
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/admin/list');
    expect(res.status).toBe(200);
  });

  test('GET /admin/audit/logs returns logs', async () => {
    AuditLog.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ action: 'x' }])
        })
      })
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/admin/audit/logs');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('DELETE /account forbids admin self-delete', async () => {
    User.findById.mockResolvedValue({ role: 'admin' });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).delete('/api/users/account');
    expect(res.status).toBe(403);
  });

  test('DELETE /account deactivates normal user', async () => {
    User.findById.mockResolvedValue({
      _id: 'u1',
      role: 'user',
      tokenVersion: 0,
      save: jest.fn().mockResolvedValue()
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).delete('/api/users/account');
    expect(res.status).toBe(200);
  });

  test('PUT /preferences updates preferences', async () => {
    User.findById.mockResolvedValue({
      preferences: { dietary: [], allergies: [] },
      save: jest.fn().mockResolvedValue()
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/preferences').send({ dietary: ['vegan'] });
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/status returns 404 for missing user', async () => {
    User.findById.mockResolvedValue(null);
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/status').send({ isActive: true });
    expect(res.status).toBe(404);
  });

  test('PATCH /admin/:id/restore blocks admin target', async () => {
    User.findById.mockResolvedValue({ role: 'admin' });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/restore');
    expect(res.status).toBe(403);
  });

  test('GET /stats returns stats payload', async () => {
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'u1',
          favorites: [],
          savedNews: [],
          weight: 80,
          goals: { targetWeight: 75 },
          calculateBMI: () => '24.0'
        })
      })
    });
    Recipe.countDocuments.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalFavorites).toBe(2);
  });

  test('GET /stats handles internal error', async () => {
    User.findById.mockImplementation(() => {
      throw new Error('stats db down');
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/stats');
    expect(res.status).toBe(500);
  });

  test('GET /admin/:id returns 404 when user not found', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      })
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/admin/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('PATCH /admin/:id/status updates user status', async () => {
    User.findById.mockResolvedValue({
      _id: 'u2',
      role: 'user',
      tokenVersion: 0,
      save: jest.fn().mockResolvedValue(),
      toPublicProfile: () => ({ _id: 'u2' })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/status').send({ isActive: false });
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/restore success', async () => {
    User.findById.mockResolvedValue({
      _id: 'u2',
      role: 'user',
      tokenVersion: 1,
      save: jest.fn().mockResolvedValue()
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/restore');
    expect(res.status).toBe(200);
  });

  test('DELETE /admin/:id returns 404 for missing target', async () => {
    User.findById.mockResolvedValue(null);
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).delete('/api/users/admin/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('DELETE /admin/:id success soft delete path', async () => {
    User.findById.mockResolvedValue({
      _id: 'u2',
      role: 'user',
      tokenVersion: 0,
      save: jest.fn().mockResolvedValue()
    });
    Recipe.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ _id: 'r1' }]) });
    Review.deleteMany.mockResolvedValue({});
    Recipe.updateMany.mockResolvedValue({});
    User.updateMany.mockResolvedValue({});

    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).delete('/api/users/admin/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
  });

  test('PUT /profile validation error branch', async () => {
    User.findById.mockResolvedValue({
      preferences: {},
      save: jest.fn().mockRejectedValue({ name: 'ValidationError', errors: { age: { message: 'Edad invalida' } } })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/profile').send({ age: 200 });
    expect(res.status).toBe(400);
  });

  test('PUT /profile success branch', async () => {
    User.findById.mockResolvedValue({
      preferences: {},
      save: jest.fn().mockResolvedValue(),
      toPublicProfile: () => ({ _id: 'u1', age: 30 })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/profile').send({ age: 30, height: 180 });
    expect(res.status).toBe(200);
  });

  test('PUT /goals success branch', async () => {
    User.findById.mockResolvedValue({
      goals: {},
      save: jest.fn().mockResolvedValue()
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/goals').send({ protein: 120, goal: 'maintain' });
    expect(res.status).toBe(200);
  });

  test('PUT /goals validation error branch', async () => {
    User.findById.mockResolvedValue({
      goals: {},
      save: jest.fn().mockRejectedValue({ name: 'ValidationError', errors: { goal: { message: 'Goal invalido' } } })
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/goals').send({ goal: 'bad' });
    expect(res.status).toBe(400);
  });

  test('GET /admin/:id success branch', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: 'u2',
              toPublicProfile: () => ({ _id: 'u2' })
            })
          })
        })
      })
    });
    Recipe.countDocuments.mockResolvedValue(3);
    Review.countDocuments.mockResolvedValue(2);
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/admin/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PATCH /admin/:id/status forbidden branch', async () => {
    User.findById.mockResolvedValue({
      _id: 'u1',
      role: 'admin'
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/status').send({ isActive: true });
    expect(res.status).toBe(403);
  });

  test('PATCH /admin/:id/status returns 500 on unexpected errors', async () => {
    User.findById.mockRejectedValue(new Error('status fail'));
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/status').send({ isActive: true });
    expect(res.status).toBe(500);
  });

  test('PATCH /admin/:id/status returns 403 when cannot manage target user', async () => {
    User.findById.mockResolvedValue({
      _id: 'u2',
      role: 'admin'
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).patch('/api/users/admin/507f1f77bcf86cd799439011/status').send({ isActive: true });
    expect(res.status).toBe(403);
  });

  test('GET /menu-consumption returns persisted state', async () => {
    MenuConsumption.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        plannerVersionByPeriod: { daily: { '2026-05-09': 2 }, weekly: {}, monthly: {} },
        consumedByPeriod: { daily: { '2026-05-09': { r1: true } }, weekly: {}, monthly: {} }
      })
    });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/menu-consumption');
    expect(res.status).toBe(200);
    expect(res.body.data.plannerVersionByPeriod.daily['2026-05-09']).toBe(2);
  });

  test('PUT /menu-consumption normalizes legacy payloads', async () => {
    MenuConsumption.findOneAndUpdate.mockResolvedValue({
      plannerVersionByPeriod: { daily: { legacy: 3 }, weekly: {}, monthly: {} },
      consumedByPeriod: { daily: { legacy: { recipe1: true } }, weekly: {}, monthly: {} }
    });
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/menu-consumption').send({
      plannerVersionByPeriod: { daily: 3 },
      consumedByPeriod: { daily: { recipe1: true } }
    });
    expect(res.status).toBe(200);
    expect(MenuConsumption.findOneAndUpdate).toHaveBeenCalled();
    expect(res.body.data.plannerVersionByPeriod.daily.legacy).toBe(3);
  });

  test('GET /menu-consumption returns defaults when no persisted doc', async () => {
    MenuConsumption.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/menu-consumption');
    expect(res.status).toBe(200);
    expect(res.body.data.plannerVersionByPeriod.daily).toBe(0);
  });

  test('GET /menu-consumption returns 500 on db error', async () => {
    MenuConsumption.findOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('menu fail')) });
    const app = express();
    app.use('/api/users', usersRoutes);
    const res = await request(app).get('/api/users/menu-consumption');
    expect(res.status).toBe(500);
  });

  test('PUT /menu-consumption returns 500 on db error', async () => {
    MenuConsumption.findOneAndUpdate.mockRejectedValue(new Error('update fail'));
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    const res = await request(app).put('/api/users/menu-consumption').send({
      plannerVersionByPeriod: { daily: { a: 1 } },
      consumedByPeriod: { daily: { bucket: { r1: true } } }
    });
    expect(res.status).toBe(500);
  });
});
