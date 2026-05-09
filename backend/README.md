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

## Módulos funcionales

- `auth`: registro, login, verificación de email, perfil actual y cambio de contraseña
- `users`: perfil, objetivos, estadísticas, consumo y gestión administrativa
- `recipes`: catálogo, creación, edición, favoritos, restauración y soft-delete
- `reviews`: valoraciones y comentarios
- `news`: noticias y contenido informativo
- `ingredients`: integración de ingredientes y perfiles nutricionales
- `docs`: documentación OpenAPI / Swagger

## Seguridad implementada

- JWT para autenticación
- middleware `protect` y control de roles
- `helmet`
- `hpp`
- `express-mongo-sanitize`
- rate limiting por dominio funcional
- normalización de errores con códigos de máquina

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

Instalación:

```powershell
cd backend
npm install
```

Ejecución en desarrollo:

```powershell
npm run dev
```

Ejecución en modo normal:

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

Ejecución recomendada:

```powershell
npm test
```

Documentación relacionada:

- [backend/COVERAGE_REPORT.md](c:\Users\Usuario\Documents\NutraCore\backend\COVERAGE_REPORT.md)
- [backend/TESTING_AND_SWAGGER.md](c:\Users\Usuario\Documents\NutraCore\backend\TESTING_AND_SWAGGER.md)

## Swagger / OpenAPI

En desarrollo, la documentación puede exponerse en:

- `/api/docs`

El comportamiento depende de `NODE_ENV` y de `ENABLE_PUBLIC_API_DOCS`.

## Docker

Construir imagen local del backend:

```powershell
docker build -t nutracore-backend ./backend
```

Ejecutar con Docker Compose desde la raíz:

```powershell
docker compose up --build backend mongo
```

Dockerfile usado:

- [backend/Dockerfile](c:\Users\Usuario\Documents\NutraCore\backend\Dockerfile)

## Despliegue

El backend incluye una configuración de despliegue para Render en:

- [render.yaml](c:\Users\Usuario\Documents\NutraCore\render.yaml)

## Notas para la memoria del TFG

Puntos defendibles del backend:

- separación entre rutas, modelos, servicios y middleware
- reglas de negocio no triviales en recetas y usuarios
- tratamiento de seguridad y errores
- automatización de pruebas y cobertura
