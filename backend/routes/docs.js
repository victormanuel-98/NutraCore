const express = require('express');
const openApi = require('../docs/openapi.json');

const router = express.Router();

const renderSwaggerHtml = () => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NutraCore API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui'
    });
  </script>
</body>
</html>`;

router.get('/', (req, res) => {
  res.type('html').send(renderSwaggerHtml());
});

router.get('/openapi.json', (req, res) => {
  res.json(openApi);
});

module.exports = router;
