# NutraCore

## Informacion general del TFG

- Titulo del proyecto: `NutraCore`
- Alumno: `VICTOR MANUEL RIDAO CHAVES`
- Titulacion: `GRADO`
- Asignatura / modalidad: `Trabajo Fin de Grado`
- Curso academico: `2025-2026`
- Centro / universidad: `ADAits`
- Tutor academico: `RICARDO RUIZ ANAYA`

## Definicion del proyecto

NutraCore es una plataforma web orientada a nutricion, bienestar y planificacion alimentaria. El sistema permite gestionar autenticacion y perfiles, consultar y crear recetas con informacion nutricional, publicar resenas, consultar noticias y disponer de un panel administrativo para la gestion de contenido y usuarios.

El proyecto se desarrolla como una solucion full stack separada en `frontend` y `backend`, con una API REST en Node.js/Express y una interfaz SPA construida con React y Vite.

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
|-- backend/                 API REST, modelos, logica de negocio y pruebas backend
|-- frontend/                SPA React, rutas, componentes y pruebas browser E2E
|-- docker-compose.yml
|-- render.yaml
`-- sonar-project.properties
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

## Estado actual del proyecto

Estado tecnico consolidado:

- frontend con build verificada
- backend operativo con healthcheck
- validacion automatizada multinivel
- CI para backend y frontend E2E
- Docker Compose para entorno local completo

Resultados verificados en la ultima revision:

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

Desde el punto de vista tecnico y academico, el proyecto aporta:

- arquitectura separada y mantenible
- logica de negocio no trivial
- seguridad y validaciones reales
- trazabilidad entre requisitos, casos de prueba y resultados
- pruebas automatizadas de backend y de frontend en navegador real

Esto hace que NutraCore sea un TFG solido y defendible, especialmente porque la validacion no depende solo de pruebas manuales.

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

Imagenes base externas utilizadas:

- `mongo:7`
- `postgres:15`
- `sonarqube:community`
- `node:20-alpine`

## Calidad, pruebas y trazabilidad

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

La validacion del proyecto se ha planteado en tres niveles:

- pruebas unitarias
- pruebas de integracion
- pruebas E2E de backend y frontend

## Riesgos y consideraciones conocidas

- La maquina local usada en la ultima revision corrio con Node `22.18.0`, pero el proyecto queda preparado y fijado para Node `20.x`.
- El entorno local presento incidencias TLS al descargar dependencias y el navegador de Playwright. Esto afecta al entorno de trabajo, no al codigo funcional de NutraCore.
- Existe una divergencia documental a vigilar: el plan funcional mencionaba `25` ingredientes como umbral, mientras la implementacion backend vigente trabaja con `20`.

## Hoja de ruta resumida

Lineas de mejora posteriores recomendadas:

- endurecimiento de seguridad de transporte y dependencias
- observabilidad y logging estructurado
- mejora de metricas operativas
- optimizacion de indices y consultas
- aumento de cobertura por ramas en backend

## Despliegue y herramientas adicionales

- Render: configurado en [render.yaml](c:\Users\Usuario\Documents\NutraCore\render.yaml)
- SonarQube: configurado en [sonar-project.properties](c:\Users\Usuario\Documents\NutraCore\sonar-project.properties)
- CI backend y frontend E2E: `.github/workflows/`

## Autor

Proyecto desarrollado por `VICTOR MANUEL RIDAO CHAVES` como Trabajo Fin de Grado.
