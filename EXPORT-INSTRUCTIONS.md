# 📦 Instrucciones para Exportar NutraCore a VSCode

## 🎯 Resumen Rápido

Has creado **NutraCore** en Figma Make. Ahora vas a exportarlo para trabajar en VSCode con la siguiente estructura:

```
Tecnologías: HTML5 + CSS3 + JavaScript + React + MongoDB
Frontend: React con JavaScript puro (.jsx)
Backend: Node.js + Express + MongoDB
```

## 📋 Archivos Generados

He creado TODOS los archivos necesarios para tu TFG:

### 📘 Documentación
- `PROJECT_STRUCTURE.md` - Estructura completa del proyecto
- `INSTALLATION_GUIDE.md` - Guía paso a paso de instalación
- `CONVERSION_GUIDE.md` - Cómo convertir TypeScript a JavaScript
- `EXPORT_INSTRUCTIONS.md` - Este archivo (instrucciones de exportación)

### 🔧 Backend (Node.js + Express + MongoDB)
- `server.js` - Servidor principal
- `server-package.json` - Dependencias (renombrar a `package.json`)
- `server-env-example.txt` - Variables de entorno (renombrar a `.env.example`)

#### Modelos MongoDB:
- `models-User.js` - Modelo de Usuario
- `models-Dish.js` - Modelo de Plato
- `models-News.js` - Modelo de Noticia
- `models-Recipe.js` - Modelo de Receta (Lab)

#### Rutas API:
- `routes-auth.js` - Autenticación (login/register)
- `routes-dishes.js` - Catálogo de platos
- `routes-news.js` - Noticias y artículos
- `routes-users.js` - Perfil y configuración
- `routes-recipes.js` - NutraCore Lab

#### Middleware:
- `middleware-auth.js` - Autenticación JWT

### 💻 Frontend (React + JavaScript)
Ya convertidos a JavaScript:
- `client-App.jsx` - Componente principal
- `client-routes.jsx` - Configuración de rutas
- `client-index.jsx` - Punto de entrada React
- `client-Root.jsx` - Componente raíz

**Pendientes de conversión** (en Figma Make):
- `components/Home.tsx` → convertir a `Home.jsx`
- `components/Login.tsx` → convertir a `Login.jsx`
- `components/Register.tsx` → convertir a `Register.jsx`
- `components/Dashboard.tsx` → convertir a `Dashboard.jsx`
- `components/Catalog.tsx` → convertir a `Catalog.jsx`
- `components/News.tsx` → convertir a `News.jsx`
- `components/NutraCoreLab.tsx` → convertir a `NutraCoreLab.jsx`
- `components/Profile.tsx` → convertir a `Profile.jsx`
- `components/NotFound.tsx` → convertir a `NotFound.jsx`
- `components/Navbar.tsx` → convertir a `Navbar.jsx`
- `styles/globals.css` - Estilos (ya está listo)

---

## 🚀 Pasos para Exportar

### Paso 1: Crear Estructura de Carpetas

Abre tu terminal y ejecuta:

```bash
# Crear carpeta principal del proyecto
mkdir nutracore
cd nutracore

# Crear subcarpetas
mkdir server
mkdir client
cd server
mkdir config models routes middleware controllers
cd ../client
mkdir src public
cd src
mkdir components styles
cd ../..
```

Deberías tener:
```
nutracore/
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
└── client/
    ├── src/
    │   ├── components/
    │   └── styles/
    └── public/
```

---

### Paso 2: Copiar Archivos del Backend

Desde Figma Make, copia cada archivo a su ubicación correspondiente:

#### A. Archivo principal del servidor
```bash
# Copiar contenido de 'server.js' de Figma Make a:
nutracore/server/server.js
```

#### B. Package.json del servidor
```bash
# Copiar contenido de 'server-package.json' a:
nutracore/server/package.json
```

#### C. Variables de entorno
```bash
# Copiar contenido de 'server-env-example.txt' a:
nutracore/server/.env.example

# Luego crear el archivo real:
cp .env.example .env
# Editar .env con tus configuraciones
```

#### D. Modelos (carpeta models/)
Copiar cada archivo eliminando el prefijo `models-`:
- `models-User.js` → `server/models/User.js`
- `models-Dish.js` → `server/models/Dish.js`
- `models-News.js` → `server/models/News.js`
- `models-Recipe.js` → `server/models/Recipe.js`

#### E. Rutas (carpeta routes/)
Copiar cada archivo eliminando el prefijo `routes-`:
- `routes-auth.js` → `server/routes/auth.js`
- `routes-dishes.js` → `server/routes/dishes.js`
- `routes-news.js` → `server/routes/news.js`
- `routes-users.js` → `server/routes/users.js`
- `routes-recipes.js` → `server/routes/recipes.js`

#### F. Middleware (carpeta middleware/)
- `middleware-auth.js` → `server/middleware/auth.js`

---

### Paso 3: Copiar Archivos del Frontend

#### A. Archivos principales ya convertidos
Copiar eliminando el prefijo `client-`:
- `client-App.jsx` → `client/src/App.jsx`
- `client-routes.jsx` → `client/src/routes.jsx`
- `client-index.jsx` → `client/src/index.jsx`
- `client-Root.jsx` → `client/src/components/Root.jsx`

#### B. Estilos
- Copiar `styles/globals.css` de Figma Make → `client/src/styles/globals.css`

#### C. Componentes (conversión TypeScript → JavaScript)

**IMPORTANTE:** Los siguientes archivos están en TypeScript (.tsx) en Figma Make.

Para cada archivo:
1. Abre el archivo `.tsx` en Figma Make
2. Copia TODO el contenido
3. Pégalo en VSCode en un archivo `.jsx`
4. **Elimina todas las anotaciones de tipos TypeScript:**
   - Elimina `interface ...`
   - Elimina `type ...`
   - Elimina `: string`, `: number`, etc.
   - Cambia `useState<Type>(...)` por `useState(...)`
   - Elimina tipos de props: `({ name }: { name: string })` → `({ name })`

**Lista de conversiones:**
- `components/Home.tsx` → `client/src/components/Home.jsx`
- `components/Login.tsx` → `client/src/components/Login.jsx`
- `components/Register.tsx` → `client/src/components/Register.jsx`
- `components/Dashboard.tsx` → `client/src/components/Dashboard.jsx`
- `components/Catalog.tsx` → `client/src/components/Catalog.jsx`
- `components/News.tsx` → `client/src/components/News.jsx`
- `components/NutraCoreLab.tsx` → `client/src/components/NutraCoreLab.jsx`
- `components/Profile.tsx` → `client/src/components/Profile.jsx`
- `components/NotFound.tsx` → `client/src/components/NotFound.jsx`
- `components/Navbar.tsx` → `client/src/components/Navbar.jsx`

**Ver `CONVERSION_GUIDE.md` para ejemplos detallados.**

#### D. Crear archivos de configuración del cliente

##### `client/public/index.html`
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#C41D63" />
    <meta name="description" content="NutraCore - Dashboard de Nutrición Inteligente" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Gajraj+One&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>NutraCore | Tu Dashboard de Nutrición</title>
  </head>
  <body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

##### `client/package.json`
```json
{
  "name": "nutracore-client",
  "version": "1.0.0",
  "description": "NutraCore - Frontend React",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.300.0",
    "recharts": "^2.10.0",
    "axios": "^1.6.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "react-scripts": "5.0.1"
  },
  "proxy": "http://localhost:5000"
}
```

##### `client/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

##### `client/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nutracore-pink': '#C41D63',
      },
      fontFamily: {
        'gajraj': ['Gajraj One', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

### Paso 4: Instalar Dependencias

#### Backend
```bash
cd nutracore/server
npm install
```

Esto instalará:
- express
- mongoose
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- nodemon (dev)

#### Frontend
```bash
cd ../client
npm install
```

Esto instalará:
- react
- react-dom
- react-router-dom
- lucide-react
- recharts
- axios
- tailwindcss
- react-scripts

---

### Paso 5: Configurar MongoDB

#### Opción A: MongoDB Local (Recomendado para desarrollo)

**Windows:**
1. Descarga: https://www.mongodb.com/try/download/community
2. Instala MongoDB Community Server
3. Inicia el servicio MongoDB
4. Verifica que corra en puerto 27017

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Verificar instalación:**
```bash
mongosh
# o
mongo
```

#### Opción B: MongoDB Atlas (Cloud - gratis)

1. Crea cuenta en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito
3. Obtén la connection string
4. Actualiza `server/.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nutracore
```

---

### Paso 6: Iniciar la Aplicación

#### Terminal 1 - Backend
```bash
cd nutracore/server
npm run dev
```

Deberías ver:
```
✅ Servidor corriendo en puerto 5000
✅ MongoDB conectado exitosamente
```

#### Terminal 2 - Frontend
```bash
cd nutracore/client
npm start
```

Se abrirá automáticamente en: http://localhost:3000

---

## ✅ Verificación

Tu aplicación está funcionando correctamente si:

1. ✅ Backend corre en http://localhost:5000
2. ✅ Frontend corre en http://localhost:3000
3. ✅ MongoDB está conectado (mensaje en terminal del backend)
4. ✅ No hay errores en las consolas
5. ✅ Puedes ver la página de inicio de NutraCore
6. ✅ Puedes navegar a /login y /register

---

## 🎓 Para tu TFG

### Documentación incluida:
- ✅ Código completamente comentado
- ✅ Estructura escalable
- ✅ Buenas prácticas de desarrollo
- ✅ Separación frontend/backend
- ✅ API RESTful documentada
- ✅ Seguridad con JWT
- ✅ Validaciones de datos

### Tecnologías (cumple requisitos):
- ✅ **HTML5** - Estructura semántica
- ✅ **CSS3** - Tailwind CSS (genera CSS3)
- ✅ **JavaScript** - Todo en JavaScript puro (.jsx)
- ✅ **React** - Librería frontend
- ✅ **MongoDB** - Base de datos NoSQL

### Características implementadas:
- ✅ Sistema de autenticación (JWT)
- ✅ Catálogo de platos con filtros
- ✅ Sistema de favoritos
- ✅ Noticias sobre nutrición
- ✅ NutraCore Lab (creador de recetas)
- ✅ Gestión de perfil y objetivos
- ✅ Dashboard interactivo
- ✅ Diseño responsive
- ✅ API RESTful completa

---

## 📞 Próximos Pasos

1. **Poblar la base de datos** (opcional):
   - Crea datos de ejemplo manualmente
   - O crea un script de seed

2. **Personalizar**:
   - Añadir más platos
   - Añadir más noticias
   - Personalizar diseño

3. **Despliegue** (para producción):
   - Frontend: Vercel, Netlify
   - Backend: Heroku, Railway, Render
   - Database: MongoDB Atlas

---

## 🔧 Solución de Problemas

### Error: "Cannot find module..."
```bash
# Reinstalar dependencias
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env o matar proceso
lsof -ti:5000 | xargs kill
```

### Error: "MongoDB connection failed"
```bash
# Verificar que MongoDB esté corriendo
mongosh
```

### Error en compilación de Tailwind
```bash
# Reinstalar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 📚 Recursos Adicionales

- **React**: https://react.dev
- **Express**: https://expressjs.com
- **MongoDB**: https://www.mongodb.com/docs
- **Mongoose**: https://mongoosejs.com
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com

---

¡Listo! Ahora tienes todo lo necesario para trabajar en NutraCore desde VSCode con la stack completa: HTML5, CSS3, JavaScript, React y MongoDB.

Para cualquier duda, revisa:
- `PROJECT_STRUCTURE.md` - Estructura del proyecto
- `INSTALLATION_GUIDE.md` - Guía de instalación detallada
- `CONVERSION_GUIDE.md` - Cómo convertir TypeScript a JavaScript
