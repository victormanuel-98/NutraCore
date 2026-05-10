# Backend de NutraCore

## Descripcion

El backend de NutraCore expone una API REST para autenticacion, usuarios, recetas, resenas, noticias, ingredientes y administracion. Tambien centraliza las reglas de negocio, la seguridad, la normalizacion de errores y la validacion automatizada del servidor.

## Stack tecnico

- Node.js `20.x`
- Express
- MongoDB + Mongoose
- JWT
- Nodemailer / Mailjet
- Cloudinary
- Jest + Supertest

## Estructura destacada

```text
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

## Modulos funcionales

- `auth`: registro, login, verificacion de email, perfil actual y cambio de contrasena
- `users`: perfil, objetivos, estadisticas, consumo y gestion administrativa
- `recipes`: catalogo, creacion, edicion, favoritos, restauracion y soft-delete
- `reviews`: valoraciones y comentarios
- `news`: noticias y contenido informativo
- `ingredients`: integracion de ingredientes y perfiles nutricionales
- `docs`: documentacion OpenAPI / Swagger

## Seguridad implementada

- JWT para autenticacion
- middleware `protect` y control de roles
- `helmet`
- `hpp`
- `express-mongo-sanitize`
- rate limiting por dominio funcional
- normalizacion de errores con codigos de maquina

## Dependencias principales

```text
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

```text
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

Instalacion:

```powershell
cd backend
npm install
```

Ejecucion en desarrollo:

```powershell
npm run dev
```

Ejecucion en modo normal:

```powershell
npm start
```

Puerto esperado:

- `http://localhost:5000`

Healthcheck:

- `http://localhost:5000/health`

## Scripts disponibles

```powershell
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

- medicion informativa: `npm run test:coverage`
- umbral de control actual: `npm run test:coverage:70`

Estado validado en la ultima revision:

- backend E2E: `8` tests OK
- backend global: `21` suites, `154` tests OK

Resumen historico de cobertura disponible:

- statements: `80.24%`
- lines: `82.64%`
- functions: `83.85%`
- branches: `58.67%`

Cobertura por modulo con mayor interes:

- `routes/`: `78.19%` statements
- `services/`: `84.61%` statements
- `middleware/`: `88.54%` statements
- `config/`: `75.38%` statements
- `models/`: `80.74%` statements

Swagger / OpenAPI:

- UI Swagger: `http://localhost:5000/api/docs`
- especificacion OpenAPI: `http://localhost:5000/api/docs/openapi.json`
- archivo fuente principal: `backend/docs/openapi.json`

## Riesgos tecnicos detectados

Zonas con mayor margen de mejora:

- flujos de error y edge cases en `news` y `dishes`
- ramas complejas en `recipes`
- hooks y metodos internos en `Recipe`, `Review` y `User`
- ramas costosas en servicios con integracion externa, especialmente `openFoodFactsService`

Observacion funcional relevante:

- el backend ya bloquea `REC-07` por exceso de contenido en lugar de truncarlo silenciosamente
- el valor tecnico actual para ingredientes es `20`, no `25`

## Docker

Construir imagen local del backend:

```powershell
docker build -t nutracore-backend ./backend
```

Ejecutar con Docker Compose desde la raiz:

```powershell
docker compose up --build backend mongo
```

Dockerfile usado:

- [backend/Dockerfile](c:\Users\Usuario\Documents\NutraCore\backend\Dockerfile)

## Despliegue

El backend incluye una configuracion de despliegue para Render en:

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
