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
├── app.js
├── server.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── scripts/
├── docs/
└── tests/
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
```

## Pruebas

La estrategia de pruebas del backend incluye:

- unit tests
- integration tests
- E2E funcionales sobre API

Ejecucion recomendada:

```powershell
npm test
```

Documentacion relacionada:

- [backend/COVERAGE_REPORT.md](c:\Users\Usuario\Documents\NutraCore\backend\COVERAGE_REPORT.md)
- [backend/TESTING_AND_SWAGGER.md](c:\Users\Usuario\Documents\NutraCore\backend\TESTING_AND_SWAGGER.md)

## Swagger / OpenAPI

En desarrollo, la documentacion puede exponerse en:

- `/api/docs`

El comportamiento depende de `NODE_ENV` y de `ENABLE_PUBLIC_API_DOCS`.

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

## Notas para la memoria del TFG

Puntos defendibles del backend:

- separacion entre rutas, modelos, servicios y middleware
- reglas de negocio no triviales en recetas y usuarios
- tratamiento de seguridad y errores
- automatizacion de pruebas y cobertura

