const express = require('express');
const request = require('supertest');
const { validateObjectIdParam, requireBodyFields } = require('../../middleware/validation');

describe('validation middleware', () => {
  test('validateObjectIdParam should reject invalid id', async () => {
    const app = express();
    app.get('/items/:id', validateObjectIdParam('id'), (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/items/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('requireBodyFields should require fields', async () => {
    const app = express();
    app.use(express.json());
    app.post('/submit', requireBodyFields(['email', 'password']), (req, res) => res.json({ ok: true }));

    const res = await request(app).post('/submit').send({ email: 'a@a.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/);
  });
});
