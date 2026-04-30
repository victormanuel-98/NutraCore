const request = require('supertest');
const { createApp } = require('../../app');

describe('system e2e', () => {
  test('GET / should expose API metadata', async () => {
    const app = createApp({ mongooseRef: { connection: { readyState: 0 } } });
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('NutraCore API');
    expect(res.body.endpoints).toBeDefined();
  });

  test('GET /health should return disconnected when mongodb is down', async () => {
    const app = createApp({ mongooseRef: { connection: { readyState: 0 } } });
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.mongodb).toBe('disconnected');
  });

  test('GET /api/docs and /api/docs/openapi.json should be available', async () => {
    const app = createApp({ mongooseRef: { connection: { readyState: 1 } } });

    const html = await request(app).get('/api/docs');
    expect(html.status).toBe(200);
    expect(html.text).toMatch(/SwaggerUIBundle/);

    const spec = await request(app).get('/api/docs/openapi.json');
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe('3.0.3');
  });
});
