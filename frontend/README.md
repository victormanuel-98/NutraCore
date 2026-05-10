# Frontend de NutraCore

## Descripción

El frontend de NutraCore es una SPA construida con React y Vite. Su objetivo es ofrecer una experiencia visual clara para autenticación, consulta de recetas, dashboard, perfil, noticias, administración y uso de NutraCore Lab.

## Stack técnico

- React `18`
- Vite
- React Router DOM
- Radix UI
- Lucide React
- Playwright para pruebas browser E2E

## Dependencias principales

```
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

```
vite
@playwright/test
cross-env
```

## Estructura principal

```
frontend/
|-- public/
|-- src/
|   |-- components/
|   |-- context/
|   |-- pages/
|   |-- services/
|   |-- styles/
|   `-- utils/
|-- tests/
|   `-- e2e/
`-- vite.config.js
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

## Características del frontend

- Rutas protegidas para usuario autenticado
- Control de acceso por rol para el área admin
- Dashboard con información personalizada
- Catálogo de recetas con filtros y detalle
- Formularios de autenticación y registro
- Secciones legales y de privacidad
- Tema y notificaciones mediante contextos

## Variables de entorno

Usar como referencia:

- [frontend/.env.example](c:\Users\Usuario\Documents\NutraCore\frontend\.env.example)

Variables principales:

- `VITE_API_URL`
- `VITE_GAIUS_AVATAR_URL`

## Arranque local

Instalación:

```
cd frontend
npm install
```

Modo desarrollo:

```
npm run dev
```

Build de producción:

```
npm run build
```

Previsualización de la build:

```
npm run preview
```

## Scripts disponibles

```
npm run dev
npm run dev:e2e
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:report
```

## Validación E2E del frontend

El proyecto incorpora Playwright para validar comportamiento real en navegador.

Cobertura funcional browser-level:

- responsive del formulario de registro
- responsive del catálogo y de sus cards
- menú móvil usable
- feedback visual de carga en login
- manejo amigable de errores de red

Breakpoints validados:

- `375x667`
- `393x852`
- `768x1024`
- desktop `1280px+`

Estado verificado:

- `20` tests totales
- `18` OK
- `2` skipped por no aplicar al breakpoint

Ejecucion:

```powershell
npm run test:e2e
```

Reporte HTML:

```powershell
npm run test:e2e:report
```

## Integración con backend

El frontend consume la API definida en `VITE_API_URL` y esta preparado para:

- Autenticación con JWT
- Rutas protegidas
- Gestión de errores traducidos a mensajes amigables
- Consumo de endpoints de recetas, usuarios, noticias y autenticación

## Docker

Construir imagen local del frontend:

```
docker build -t nutracore-frontend ./frontend
```

Ejecutar con Docker Compose desde la raíz:

```
docker compose up --build frontend
```

Dockerfile usado:

- [frontend/Dockerfile](c:\Users\Usuario\Documents\NutraCore\frontend\Dockerfile)

## Espacio para recursos visuales del TFG

### GIFs de recorrido de la aplicación

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

- Separación entre componentes, servicios, contextos y rutas
- Protección de navegación según autenticación y rol
- Validación browser-level con Playwright
- Experiencia responsive contemplada en pruebas
