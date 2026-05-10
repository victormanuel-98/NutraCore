# Backend de NutraCore

## Descripción

El backend de NutraCore expone una API REST para autenticación, usuarios, recetas, reseñas, noticias, ingredientes y administración. También centraliza las reglas de negocio, la seguridad, la normalización de errores y la validación automatizada del servidor.

## Stack técnico

- Node.js `20.x`
- Express
- MongoDB + Mongoose
- JWT
- Nodemailer / Mailjet
- Cloudinary
- Jest + Supertest

## Estructura destacada

```
backend/
|-- app.js
|-- server.js
|-- config/
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- services/
|-- scripts/
|-- docs/
`-- tests/
```

## Módulos funcionales

- `auth`: registro, login, verificación de email, perfil actual y cambio de contraseña
- `users`: perfil, objetivos, estadísticas, consumo y gestión administrativa
- `recipes`: catálogo, creación, edición, favoritos, restauración y soft-delete
- `reviews`: valoraciones y comentarios
- `news`: noticias y contenido informativo
- `ingredients`: integración de ingredientes y perfiles nutricionales
- `docs`: documentacion OpenAPI / Swagger

## Seguridad implementada

- JWT para autenticación
- middleware `protect` y control de roles
- `helmet`
- `hpp`
- `express-mongo-sanitize`
- rate limiting por dominio funcional
- normalización de errores con códigos de máquina

## Dependencias principales

```
bcryptjs
cloudinary
cors
dotenv
express
express-mongo-sanitize
helmet
hpp
jsonwebtoken
mongoose
node-mailjet
nodemailer
swagger-ui-dist
```

Dependencias de desarrollo:

```
jest
mongodb-memory-server
nodemon
supertest
```

## Variables de entorno

Usar como referencia:

- [backend/.env.example](c:\Users\Usuario\Documents\NutraCore\backend\.env.example)

Variables importantes:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `TRUST_PROXY`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `SMTP_*`
- `CLOUDINARY_*`
- `ENABLE_PUBLIC_API_DOCS`

## Arranque local

Instalación:

```
cd backend
npm install
```

Ejecución en desarrollo:

```
npm run dev
```

Ejecución en modo normal:

```
npm start
```

Puerto esperado:

- `http://localhost:5000`

Healthcheck:

- `http://localhost:5000/health`

## Scripts disponibles

```
npm start
npm run dev
npm run seed
npm run create-admin
npm run normalize-aliases
npm run migrate-static-assets
npm run clean-db
npm run docs:export
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
npm run test:coverage:70
```

## Testing, cobertura y Swagger

Tipos de prueba disponibles:

- unitarias: `npm run test:unit`
- integracion: `npm run test:integration`
- E2E: `npm run test:e2e`
- suite completa: `npm test`

Cobertura:

- medición informativa: `npm run test:coverage`
- umbral de control actual: `npm run test:coverage:70`

Estado validado en la última revisión:

- backend E2E: `8` tests OK
- backend global: `21` suites, `154` tests OK

Resumen histórico de cobertura disponible:

- statements: `84.24%`
- lines: `82.64%`
- functions: `83.85%`
- branches: `70.67%`

Cobertura por módulo con mayor interés:

- `routes/`: `78.19%` statements
- `services/`: `84.61%` statements
- `middleware/`: `88.54%` statements
- `config/`: `75.38%` statements
- `models/`: `80.74%` statements

Swagger / OpenAPI:

- UI Swagger: `http://localhost:5000/api/docs`
- especificación OpenAPI: `http://localhost:5000/api/docs/openapi.json`
- archivo fuente principal: `backend/docs/openapi.json`

## Riesgos técnicos detectados

Zonas con mayor margen de mejora:

- flujos de error y edge cases en `news` y `dishes`
- ramas complejas en `recipes`
- hooks y métodos internos en `Recipe`, `Review` y `User`
- ramas costosas en servicios con integración externa, especialmente `openFoodFactsService`

Observación funcional relevante:

- el backend ya bloquea `REC-07` por exceso de contenido en lugar de truncarlo silenciosamente
- el valor técnico actual para ingredientes es `20`, no `25`

## Docker

Construir imagen local del backend:

```
docker build -t nutracore-backend ./backend
```

Ejecutar con Docker Compose desde la raiz:

```
docker compose up --build backend mongo
```

Dockerfile usado:

- [backend/Dockerfile](c:\Users\Usuario\Documents\NutraCore\backend\Dockerfile)

## Despliegue

El backend incluye una configuración de despliegue para Render en:

- [render.yaml](c:\Users\Usuario\Documents\NutraCore\render.yaml)

## Roadmap de mejora

Sprint 1:

- reforzar transporte seguro y dependencias de correo
- consolidar CORS whitelist y proxy real
- mantener middleware de seguridad HTTP y sanitizacion
- unificar el contrato de errores
- mantener CI minima obligatoria

Sprint 2:

- introducir observabilidad y logging estructurado
- ampliar metricas y checks operativos
- optimizar indices y consultas
- estudiar cache externa si hay necesidad de escalado
- subir cobertura por ramas en rutas criticas

## Notas para la memoria del TFG

Puntos defendibles del backend:

- separacion entre rutas, modelos, servicios y middleware
- reglas de negocio no triviales en recetas y usuarios
- tratamiento de seguridad y errores
- automatizacion de pruebas y cobertura
