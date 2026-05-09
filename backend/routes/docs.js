const express = require('express');
const swaggerUiDist = require('swagger-ui-dist');
const buildOpenApiSpec = require('../docs/openapi');

const router = express.Router();
const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();

const SWAGGER_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self'"
].join(';');

const renderSwaggerHtml = () => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NutraCore API Docs</title>
  <link rel="stylesheet" href="/api/docs/assets/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/docs/assets/swagger-ui-bundle.js"></script>
  <script src="/api/docs/swagger-init.js"></script>
</body>
</html>`;

router.use('/assets', express.static(swaggerUiPath));

router.get('/', (req, res) => {
  res.setHeader('Content-Security-Policy', SWAGGER_CSP);
  res.type('html').send(renderSwaggerHtml());
});

router.get('/swagger-init.js', (req, res) => {
  res.setHeader('Content-Security-Policy', SWAGGER_CSP);
  res.type('application/javascript').send(`
window.ui = SwaggerUIBundle({
  url: '/api/docs/openapi.json',
  dom_id: '#swagger-ui'
});
  `.trim());
});

router.get('/openapi.json', (req, res) => {
  res.json(buildOpenApiSpec());
});

module.exports = router;
