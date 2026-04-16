# NutraCore - Estructura del Proyecto

## 📁 Estructura de Archivos

```
nutracore/
├── client/                          # Frontend React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Componentes React
│   │   │   ├── Catalog.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── News.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── NutraCoreLab.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Root.jsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── README.md
│
├── server/                          # Backend Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js                    # Configuración MongoDB
│   ├── models/
│   │   ├── User.js                  # Schema Usuario
│   │   ├── Dish.js                  # Schema Plato
│   │   ├── News.js                  # Schema Noticia
│   │   └── Recipe.js                # Schema Receta (Lab)
│   ├── routes/
│   │   ├── auth.js                  # Rutas autenticación
│   │   ├── dishes.js                # Rutas platos
│   │   ├── news.js                  # Rutas noticias
│   │   ├── users.js                 # Rutas usuario/perfil
│   │   └── recipes.js               # Rutas recetas
│   ├── middleware/
│   │   └── auth.js                  # Middleware autenticación JWT
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dishController.js
│   │   ├── newsController.js
│   │   ├── userController.js
│   │   └── recipeController.js
│   ├── .env.example                 # Variables de entorno
│   ├── server.js                    # Punto de entrada servidor
│   └── package.json
│
└── README.md                        # Documentación principal
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones (Tailwind CSS)
- **JavaScript (ES6+)** - Lógica de aplicación
- **React 18** - Librería UI
- **React Router 6** - Navegación SPA

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcrypt** - Encriptación contraseñas

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js >= 16.x
- MongoDB instalado y corriendo
- npm o yarn

### 1. Clonar/Copiar el proyecto
```bash
# Crea la carpeta del proyecto
mkdir nutracore
cd nutracore
```

### 2. Configurar Backend
```bash
# Navegar a la carpeta server
cd server

# Instalar dependencias
npm install

# Crear archivo .env (copiar de .env.example)
cp .env.example .env

# Editar .env con tus configuraciones
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/nutracore
# JWT_SECRET=tu_clave_secreta_aqui

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Configurar Frontend
```bash
# Abrir nueva terminal
# Navegar a la carpeta client
cd client

# Instalar dependencias
npm install

# Iniciar aplicación React
npm start
```

### 4. Acceder a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Scripts Disponibles

### Backend (server/)
```bash
npm start          # Inicia servidor producción
npm run dev        # Inicia servidor desarrollo (nodemon)
npm run seed       # Poblar base de datos con datos de ejemplo
```

### Frontend (client/)
```bash
npm start          # Inicia app desarrollo
npm run build      # Build producción
npm test           # Ejecutar tests
```

## 🔑 Variables de Entorno

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutracore
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Base de Datos MongoDB

### Colecciones
- **users** - Usuarios de la aplicación
- **dishes** - Catálogo de platos
- **news** - Noticias y artículos
- **recipes** - Recetas creadas en NutraCore Lab

## 🎨 Diseño

### Paleta de Colores
- **Principal**: Blanco (#FFFFFF)
- **Acento**: Rosa NutraCore (#C41D63)
- **Texto**: Gris oscuro (#1a1a1a)

### Tipografías
- **Logo**: Gajraj One
- **Texto general**: Inter
- **Eslogan**: Bitcount Single
- **Navbar**: ByteSized

## 📱 Características Implementadas

### Autenticación
- [x] Registro de usuarios
- [x] Login con JWT
- [x] Protección de rutas privadas

### Dashboard
- [x] Vista general de estadísticas
- [x] Macronutrientes
- [x] Objetivos personales

### Catálogo de Platos
- [x] Listado de platos
- [x] Filtros por categoría
- [x] Búsqueda
- [x] Sistema de favoritos

### NutraCore Lab
- [x] Creador de recetas
- [x] Calculadora de calorías
- [x] Análisis nutricional

### Noticias
- [x] Feed de noticias
- [x] Filtrado por categoría
- [x] Guardado de artículos

### Perfil
- [x] Gestión de datos personales
- [x] Objetivos nutricionales
- [x] Configuración de preferencias

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Platos
- `GET /api/dishes` - Listar platos
- `GET /api/dishes/:id` - Detalle plato
- `POST /api/dishes/:id/favorite` - Toggle favorito

### Noticias
- `GET /api/news` - Listar noticias
- `GET /api/news/:id` - Detalle noticia

### Usuario/Perfil
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/goals` - Actualizar objetivos

### Recetas (Lab)
- `GET /api/recipes` - Listar mis recetas
- `POST /api/recipes` - Crear receta
- `DELETE /api/recipes/:id` - Eliminar receta

## 📖 Uso para TFG

Este proyecto está diseñado como TFG con propósito educativo y demostrativo. Incluye:

1. **Documentación completa** de arquitectura y tecnologías
2. **Código comentado** para facilitar comprensión
3. **Buenas prácticas** de desarrollo web moderno
4. **Estructura escalable** para futuras mejoras
5. **Responsive design** para múltiples dispositivos

## 🤝 Contribución

Este es un proyecto académico (TFG), pero cualquier sugerencia es bienvenida.

## 📄 Licencia

Proyecto educativo - NutraCore 2026
