# NutraCore

## Información general del TFG

- Título del proyecto: `NutraCore`
- Alumno: `VICTOR MANUEL RIDAO CHAVES`
- Titulación: `GRADO`
- Asignatura / modalidad: `Trabajo Fin de Grado`
- Curso académico: `2025-2026`
- Centro escolar: `Instituto Teconológico Superior ADA`
- Tutor academico: `RICARDO RUIZ ANAYA`

## Definición del proyecto

NutraCore es una plataforma web orientada a nutrición, bienestar y planificación alimentaria. El sistema permite gestionar autenticación y perfiles, consultar y crear recetas con informacion nutricional, publicar reseñas, consultar noticias y disponer de un panel administrativo para la gestión de contenido y usuarios.

El proyecto se desarrolla como una solución full-stack separada en `frontend` y `backend`, con una API REST en Node.js/Express y una interfaz SPA construida con React y Vite.

## Objetivos del proyecto

- Centralizar en una sola aplicación herramientas de nutrición y seguimiento básico.
- Facilitar la creación y consulta de recetas con cálculo nutricional automático.
- Ofrecer autenticación segura, uso de roles y protección de rutas.
- Incorporar validación automatizada mediante pruebas `unitarias`, `integración` y `e2e`.
- Presentar una arquitectura modular y mantenible en un contexto académico.

## Alcance funcional

El sistema incluye las siguientes áreas principales:

- AutenticaciÓn, login, verificaciÓn de correo y control de acceso.
- Catálogo de recetas y buscador.
- NutraCore Lab para la creación y edición de recetas.
- Cálculo automático de macros y calorías.
- Perfil de usuario y dashboard.
- Sistema de reseñas.
- Panel administrativo.
- Sección de noticias enfocadas en la nutrición y los buenos hábitos.

## Arquitectura del proyecto

### Estructura principal

```
NutraCore/
|-- backend/                 API REST, modelos, lógica de negocio y pruebas backend
|-- frontend/                SPA React, rutas, componentes y pruebas browser E2E
|-- docker-compose.yml
|-- render.yaml
`-- sonar-project.properties
```

### Tecnologías utilizadas

Backend:

- Node.js 20
- Express
- MongoDB + Mongoose
- JWT
- Nodemailer / Mailjet
- Cloudinary
- Jest + Supertest

Frontend:

- React 18
- Vite
- React Router DOM
- Radix UI
- Lucide React
- Playwright

Herramientas complementarias:

- Docker y Docker Compose
- SonarQube
- Render
- GitHub Actions

## Dependencias relevantes

### Dependencias del backend

Principales librerias:

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `helmet`
- `cors`
- `express-mongo-sanitize`
- `hpp`
- `nodemailer`
- `node-mailjet`
- `cloudinary`

Dependencias de desarrollo:

- `jest`
- `supertest`
- `mongodb-memory-server`
- `nodemon`

### Dependencias del frontend

Principales librerias:

- `react`
- `react-dom`
- `react-router-dom`
- `@radix-ui/react-*`
- `lucide-react`
- `clsx`
- `class-variance-authority`
- `tailwind-merge`

Dependencias de desarrollo:

- `vite`
- `@playwright/test`
- `cross-env`

## Estado actual del proyecto

Estado técnico consolidado:

- Frontend con build verificada
- Backend operativo con healthcheck
- Validación automatizada multinivel
- CI para backend y frontend E2E
- Docker Compose para entorno local completo

Resultados verificados en la última revisión:

- Frontend build: OK
- Frontend Playwright E2E: `20` tests totales, `18` OK, `2` skipped por no aplicar al breakpoint
- Backend E2E: `8` tests OK
- Backend global: `21` suites, `154` tests OK

Cobertura funcional automatizada ya validada:

- AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
- REC-01, REC-02, REC-03, REC-04, REC-05, REC-06, REC-07
- SEC-01, NUT-01
- REV-01, REV-02
- USR-01, USR-02
- UX responsive, loading states y network error handling

## Valor academico del TFG

Desde el punto de vista técnico y académico, el proyecto aporta:

- Arquitectura separada y mantenible
- Lógica de negocio no trivial
- Seguridad y validaciones reales
- Trazabilidad entre requisitos, casos de prueba y resultados
- Pruebas automatizadas de backend y de frontend en navegador real

## Requisitos previos

- Node.js `20.x`
- npm `10+`
- MongoDB en local o una URI remota valida
- Docker Desktop si se va a usar contenedorizacion

El proyecto incluye `.nvmrc` y `engines` para fijar la versión recomendada de Node.

## Variables de entorno

### Backend

Basarse en:

- [backend/.env.example](c:\Users\Usuario\Documents\NutraCore\backend\.env.example)

Variables clave:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend

Basarse en:

- [frontend/.env.example](c:\Users\Usuario\Documents\NutraCore\frontend\.env.example)

Variables clave:

- `VITE_API_URL`
- `VITE_GAIUS_AVATAR_URL`

## Cómo arrancar el proyecto

### 1: desarrollo local

Instalar dependencias:

```
npm run install:all
```

Arrancar frontend y backend en paralelo:

```
npm run dev
```

Servicios esperados:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`
- health: `http://localhost:5000/health`

### 2: arranque manual por separado

Backend:

```
cd backend
npm install
npm run dev
```

Frontend:

```
cd frontend
npm install
npm run dev
```

## Docker

### Arranque completo con Docker Compose

```
docker compose up --build
```

Servicios definidos en [docker-compose.yml](c:\Users\Usuario\Documents\NutraCore\docker-compose.yml):

- `mongo`
- `backend`
- `frontend`
- `sonarqube-db`
- `sonarqube`

Puertos por defecto:

- frontend Docker: `5174`
- backend Docker: `5001`
- mongo: `27017`
- sonarqube: `9000`

### Detener contenedores

```
docker compose down
```

### Como obtener las imagenes Docker

Actualmente el proyecto no consume imagenes publicadas propias desde Docker Hub o GHCR. Las imagenes de aplicación se generan localmente a partir de los Dockerfile del repositorio:

```
docker build -t nutracore-backend ./backend
docker build -t nutracore-frontend ./frontend
```

Imagenes base externas utilizadas:

- `mongo:7`
- `postgres:15`
- `sonarqube:community`
- `node:20-alpine`

## Calidad, pruebas y trazabilidad

Backend:

```
npm --prefix backend run test
npm --prefix backend run test:e2e
npm --prefix backend run test:coverage
```

Frontend:

```
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

La validación del proyecto se ha planteado en tres niveles:

- Pruebas unitarias
- Pruebas de integración
- Pruebas E2E de backend y frontend

## Riesgos y consideraciones conocidas

- La máquina local usada en la última revisión corrió con Node `22.18.0`, pero el proyecto queda preparado y fijado para Node `20.x`.
- El entorno local presentó incidencias TLS al descargar dependencias y el navegador de Playwright. Esto afecta al entorno de trabajo, no al código funcional de NutraCore.
- Existe una divergencia documental a vigilar: el plan funcional mencionaba `25` ingredientes como umbral, mientras la implementacion backend vigente trabaja con `20`.

## Hoja de ruta resumida

Líneas de mejora posteriores recomendadas:

- Endurecimiento de seguridad de transporte y dependencias
- Observabilidad y logging estructurado
- Mejora de métricas operativas
- Optimización de indices y consultas
- Aumento de cobertura por ramas en backend

## Despliegue y herramientas adicionales

- Render: configurado en [render.yaml](c:\Users\Usuario\Documents\NutraCore\render.yaml)
- SonarQube: configurado en [sonar-project.properties](c:\Users\Usuario\Documents\NutraCore\sonar-project.properties)
- CI backend y frontend E2E: `.github/workflows/`

## Autor

Proyecto desarrollado por `VICTOR MANUEL RIDAO CHAVES` como Trabajo Fin de Grado.
