# Frontend de NutraCore

## Descripcion

El frontend de NutraCore es una SPA construida con React y Vite. Su objetivo es ofrecer una experiencia visual clara para autenticacion, consulta de recetas, dashboard, perfil, noticias, administracion y uso de NutraCore Lab.

## Stack tecnico

- React `18`
- Vite
- React Router DOM
- Radix UI
- Lucide React
- Playwright para pruebas browser E2E

## Dependencias principales

```text
react
react-dom
react-router-dom
@radix-ui/react-label
@radix-ui/react-progress
@radix-ui/react-select
@radix-ui/react-slot
@radix-ui/react-tabs
class-variance-authority
clsx
lucide-react
tailwind-merge
```

Dependencias de desarrollo:

```text
vite
@playwright/test
cross-env
```

## Estructura principal

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── tests/
│   └── e2e/
└── vite.config.js
```

## Rutas principales

- `/`
- `/login`
- `/register`
- `/verify-email`
- `/dashboard`
- `/catalog`
- `/lab`
- `/news`
- `/profile`
- `/admin/dashboard`
- `/privacy`
- `/terms`
- `/cookies`
- `/legal-notice`

## Caracteristicas del frontend

- rutas protegidas para usuario autenticado
- control de acceso por rol para el area admin
- dashboard con informacion personalizada
- catalogo de recetas con filtros y detalle
- formularios de autenticacion y registro
- secciones legales y de privacidad
- tema y notificaciones mediante contextos

## Variables de entorno

Usar como referencia:

- [frontend/.env.example](c:\Users\Usuario\Documents\NutraCore\frontend\.env.example)

Variables principales:

- `VITE_API_URL`
- `VITE_GAIUS_AVATAR_URL`

## Arranque local

Instalacion:

```powershell
cd frontend
npm install
```

Modo desarrollo:

```powershell
npm run dev
```

Build de produccion:

```powershell
npm run build
```

Previsualizacion de build:

```powershell
npm run preview
```

## Scripts disponibles

```powershell
npm run dev
npm run dev:e2e
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:report
```

## Pruebas E2E del frontend

El proyecto incorpora Playwright para validar:

- responsive design
- menu movil
- formularios principales
- estados de carga
- manejo amigable de errores de red

Ejecucion:

```powershell
npm run test:e2e
```

Reporte HTML:

```powershell
npm run test:e2e:report
```

## Docker

Construir imagen local del frontend:

```powershell
docker build -t nutracore-frontend ./frontend
```

Ejecutar con Docker Compose desde la raiz:

```powershell
docker compose up --build frontend
```

Dockerfile usado:

- [frontend/Dockerfile](c:\Users\Usuario\Documents\NutraCore\frontend\Dockerfile)

## Espacio para recursos visuales del TFG

### GIFs de recorrido de la aplicacion

Pendiente de insertar:

- GIF del flujo de registro y login
- GIF del dashboard
- GIF del catalogo de recetas
- GIF de NutraCore Lab
- GIF del panel admin

### Mockups, wireframes y Figma

Pendiente de insertar:

- captura general de arquitectura visual
- pantallas clave de Figma
- comparativa entre diseno y resultado final

Ejemplo de bloque para insertar imagen:

```md
![Mockup de Figma](./docs/figma/mockup-home.png)
```

## Notas para la memoria del TFG

Puntos destacables para defensa:

- separacion entre componentes, servicios, contextos y rutas
- proteccion de navegacion segun autenticacion y rol
- validacion browser-level con Playwright
- experiencia responsive contemplada en pruebas

