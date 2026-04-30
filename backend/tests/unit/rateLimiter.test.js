const express = require('express');
const request = require('supertest');
const { rateLimit } = require('../../middleware/rateLimiter');

describe('rateLimiter middleware', () => {
  test('should return 429 when limit is exceeded', async () => {
    const app = express();
    app.use(rateLimit({ keyPrefix: 'test', windowMs: 10000, max: 2 }));
    app.get('/limited', (req, res) => res.json({ ok: true }));

    await request(app).get('/limited').expect(200);
    await request(app).get('/limited').expect(200);
    const third = await request(app).get('/limited');

    expect(third.status).toBe(429);
    expect(third.body.success).toBe(false);
    expect(third.headers['retry-after']).toBeDefined();
  });
});
