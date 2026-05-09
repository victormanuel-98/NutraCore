# NutraCore

## Informacion general del TFG

- Titulo del proyecto: `NutraCore`
- Alumno: `VÍCTOR MANUEL RIDAO CHAVES`
- Titulacion: `GRADO`
- Asignatura / modalidad: `Trabajo Fin de Grado`
- Curso academico: `2025-2026`
- Centro / universidad: `ADAits`
- Tutor academico: `RICARDO RUÍZ ANAYA`

## Definicion del proyecto

NutraCore es una plataforma web orientada a nutricion, bienestar y planificacion alimentaria. El sistema permite gestionar autenticacion y perfiles, consultar y crear recetas con informacion nutricional, publicar resenas, consultar noticias y disponer de un panel administrativo para gestion de contenido y usuarios.

El proyecto se plantea como una solucion full stack separada en `frontend` y `backend`, con una API REST en Node.js/Express y una interfaz SPA construida con React y Vite.

## Objetivos del proyecto

- Centralizar en una sola aplicacion herramientas de nutricion y seguimiento basico.
- Facilitar la creacion y consulta de recetas con calculo nutricional automatico.
- Ofrecer autenticacion segura, roles y proteccion de rutas.
- Incorporar validacion automatizada mediante pruebas `unit`, `integration` y `e2e`.
- Presentar una arquitectura modular, mantenible y defendible en un contexto academico de TFG.

## Alcance funcional

El sistema incluye las siguientes areas principales:

- autenticacion, login, verificacion de correo y control de acceso
- catalogo de recetas y buscador
- NutraCore Lab para creacion y edicion de recetas
- calculo automatico de macros y calorias
- perfil de usuario y dashboard
- sistema de resenas
- panel administrativo
- noticias / blog

## Arquitectura del proyecto

### Estructura principal

```text
NutraCore/
├── backend/        API REST, modelos, logica de negocio y pruebas backend
├── frontend/       SPA React, rutas, componentes y pruebas browser E2E
├── docker-compose.yml
├── render.yaml
└── sonar-project.properties
```

### Tecnologias utilizadas

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

## Requisitos previos

- Node.js `20.x`
- npm `10+`
- MongoDB en local o una URI remota valida
- Docker Desktop si se va a usar contenedorizacion

El proyecto incluye `.nvmrc` y `engines` para fijar la version recomendada de Node.

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

## Como arrancar el proyecto

### Opcion 1: desarrollo local

Instalar dependencias:

```powershell
npm run install:all
```

Arrancar frontend y backend en paralelo:

```powershell
npm run dev
```

Servicios esperados:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`
- health: `http://localhost:5000/health`

### Opcion 2: arranque manual por capas

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Docker

### Arranque completo con Docker Compose

```powershell
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

```powershell
docker compose down
```

### Como obtener las imagenes Docker

Actualmente el proyecto no consume imagenes publicadas propias desde Docker Hub o GHCR. Las imagenes de aplicacion se generan localmente a partir de los Dockerfile del repositorio:

```powershell
docker build -t nutracore-backend ./backend
docker build -t nutracore-frontend ./frontend
```

Las imagenes base externas utilizadas son:

- `mongo:7`
- `postgres:15`
- `sonarqube:community`
- `node:20-alpine`

## Calidad y pruebas

Backend:

```powershell
npm --prefix backend run test
npm --prefix backend run test:e2e
npm --prefix backend run test:coverage
```

Frontend:

```powershell
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

Documentacion de apoyo:

- [REPORTE_PRUEBAS_E2E_NUTRACORE.md](c:\Users\Usuario\Documents\NutraCore\REPORTE_PRUEBAS_E2E_NUTRACORE.md)
- [MATRIZ_TRAZABILIDAD_PRUEBAS_NUTRACORE.md](c:\Users\Usuario\Documents\NutraCore\MATRIZ_TRAZABILIDAD_PRUEBAS_NUTRACORE.md)
- [MEMORIA_TECNICA_TFG_NUTRACORE.md](c:\Users\Usuario\Documents\NutraCore\MEMORIA_TECNICA_TFG_NUTRACORE.md)

## Despliegue y herramientas adicionales

- Render: configurado en [render.yaml](c:\Users\Usuario\Documents\NutraCore\render.yaml)
- SonarQube: configurado en [sonar-project.properties](c:\Users\Usuario\Documents\NutraCore\sonar-project.properties)
- CI backend y frontend E2E: `.github/workflows/`

## Documentacion complementaria existente

El repositorio contiene otros archivos `.md` heredados de iteraciones previas. Para la entrega del TFG, la documentacion de referencia recomendada es:

- este `README.md`
- `backend/README.md`
- `frontend/README.md`
- los documentos de pruebas y memoria tecnica generados para la defensa

## Autor

Proyecto desarrollado por `[Nombre y apellidos]` como Trabajo Fin de Grado.

