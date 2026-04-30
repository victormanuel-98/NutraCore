# Testing y Swagger (Backend)

## Tipos de pruebas disponibles

- Unitarias:
  - `npm run test:unit`
- Integración:
  - `npm run test:integration`
- E2E:
  - `npm run test:e2e`
- Todas:
  - `npm test`

## Cobertura

- Medición de cobertura actual:
  - `npm run test:coverage`
- Objetivo estricto `>80%` global:
  - `npm run test:coverage:80`

## Swagger

- UI Swagger:
  - `http://localhost:5000/api/docs`
- Especificación OpenAPI:
  - `http://localhost:5000/api/docs/openapi.json`

Archivo fuente de la especificación:
- `docs/openapi.json`
