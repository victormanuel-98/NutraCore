# 📑 Índice Completo de Archivos Generados

## 📘 Documentación Principal (4 archivos)

### ⭐ EMPIEZA AQUÍ
1. **`README-EXPORT.md`**
   - Resumen ejecutivo del proyecto
   - Visión general de archivos
   - Checklist de exportación
   - Enlaces rápidos

2. **`EXPORT_INSTRUCTIONS.md`**
   - Instrucciones paso a paso de exportación
   - Cómo copiar cada archivo
   - Configuración completa
   - **LÉEME SEGUNDO**

3. **`INSTALLATION_GUIDE.md`**
   - Instalación de requisitos (Node.js, MongoDB)
   - Configuración del entorno
   - Troubleshooting
   - Scripts de ejecución

4. **`CONVERSION_GUIDE.md`**
   - Cómo convertir TypeScript a JavaScript
   - Ejemplos detallados
   - Reglas de conversión
   - Errores comunes

### Documentación Técnica
5. **`PROJECT_STRUCTURE.md`**
   - Estructura completa del proyecto
   - Descripción de carpetas y archivos
   - Tecnologías utilizadas
   - Endpoints de la API

6. **`FILES_INDEX.md`** (este archivo)
   - Índice de todos los archivos generados
   - Descripción de cada uno
   - Dónde copiarlos

---

## 🔧 Backend - Node.js + Express + MongoDB (14 archivos)

### Configuración Principal (3 archivos)

#### 7. `server.js`
**Ubicación final:** `nutracore/server/server.js`
**Descripción:** Servidor Express principal, punto de entrada del backend
**Contiene:**
- Configuración de Express
- Middlewares (CORS, JSON parsing)
- Conexión a MongoDB
- Importación de rutas
- Manejo de errores
- Health check endpoint

#### 8. `server-package.json`
**Ubicación final:** `nutracore/server/package.json` ⚠️ **RENOMBRAR**
**Descripción:** Dependencias y scripts del backend
**Contiene:**
- Lista de dependencias (express, mongoose, etc.)
- Scripts (start, dev, seed)
- Información del proyecto

#### 9. `server-env-example.txt`
**Ubicación final:** `nutracore/server/.env.example` ⚠️ **RENOMBRAR**
**Descripción:** Plantilla de variables de entorno
**Contiene:**
- PORT
- MONGODB_URI
- JWT_SECRET
- NODE_ENV

**⚠️ IMPORTANTE:** Después de copiar, crear `.env` con valores reales:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

---

### Modelos MongoDB (4 archivos)

#### 10. `models-User.js`
**Ubicación final:** `nutracore/server/models/User.js` ⚠️ **Eliminar prefijo**
**Descripción:** Schema de Usuario con Mongoose
**Campos:**
- Autenticación (email, password hash)
- Datos personales (nombre, edad, género, peso, altura)
- Objetivos nutricionales
- Favoritos y guardados
- Preferencias dietéticas
**Métodos:**
- `comparePassword()` - Verificar contraseña
- `toPublicProfile()` - Perfil sin contraseña
- `calculateBMI()` - Calcular IMC

#### 11. `models-Dish.js`
**Ubicación final:** `nutracore/server/models/Dish.js`
**Descripción:** Schema de Plato del catálogo
**Campos:**
- Información básica (nombre, descripción, imagen)
- Categoría y etiquetas
- Información nutricional
- Ingredientes e instrucciones
- Popularidad (favoritos, vistas)
**Métodos:**
- `addFavorite()` - Incrementar favoritos
- `removeFavorite()` - Decrementar favoritos
- `incrementViews()` - Contar vistas

#### 12. `models-News.js`
**Ubicación final:** `nutracore/server/models/News.js`
**Descripción:** Schema de Noticia/Artículo
**Campos:**
- Contenido (título, resumen, contenido completo)
- Autor y metadata
- Categoría y etiquetas
- Métricas (vistas, likes, compartidos, guardados)
- Estado de publicación
**Métodos:**
- `incrementViews()` - Contar vistas
- `addLike()` / `removeLike()` - Gestionar likes
- `addSave()` / `removeSave()` - Gestionar guardados

#### 13. `models-Recipe.js`
**Ubicación final:** `nutracore/server/models/Recipe.js`
**Descripción:** Schema de Receta (NutraCore Lab)
**Campos:**
- Usuario creador
- Nombre y descripción
- Ingredientes con nutrición
- Nutrición total calculada
- Porciones y categoría
- Notas personales
**Métodos:**
- `calculateTotalNutrition()` - Calcular valores nutricionales

---

### Rutas API (5 archivos)

#### 14. `routes-auth.js`
**Ubicación final:** `nutracore/server/routes/auth.js`
**Descripción:** Rutas de autenticación
**Endpoints:**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual (protegido)
- `POST /api/auth/logout` - Cerrar sesión
- `PUT /api/auth/change-password` - Cambiar contraseña

#### 15. `routes-dishes.js`
**Ubicación final:** `nutracore/server/routes/dishes.js`
**Descripción:** Rutas del catálogo de platos
**Endpoints:**
- `GET /api/dishes` - Listar platos (con filtros)
- `GET /api/dishes/featured` - Platos destacados
- `GET /api/dishes/:id` - Detalle de plato
- `POST /api/dishes/:id/favorite` - Toggle favorito (protegido)
- `GET /api/dishes/user/favorites` - Mis favoritos (protegido)
- `GET /api/dishes/categories/list` - Lista de categorías

#### 16. `routes-news.js`
**Ubicación final:** `nutracore/server/routes/news.js`
**Descripción:** Rutas de noticias y artículos
**Endpoints:**
- `GET /api/news` - Listar noticias (con filtros)
- `GET /api/news/featured` - Noticias destacadas
- `GET /api/news/:id` - Detalle de noticia
- `POST /api/news/:id/save` - Guardar noticia (protegido)
- `POST /api/news/:id/like` - Like a noticia (protegido)
- `POST /api/news/:id/share` - Compartir noticia
- `GET /api/news/user/saved` - Mis noticias guardadas (protegido)

#### 17. `routes-users.js`
**Ubicación final:** `nutracore/server/routes/users.js`
**Descripción:** Rutas de perfil y configuración de usuario
**Endpoints:**
- `GET /api/users/profile` - Obtener perfil (protegido)
- `PUT /api/users/profile` - Actualizar perfil (protegido)
- `PUT /api/users/goals` - Actualizar objetivos (protegido)
- `GET /api/users/stats` - Estadísticas (protegido)
- `PUT /api/users/preferences` - Actualizar preferencias (protegido)
- `DELETE /api/users/account` - Desactivar cuenta (protegido)

#### 18. `routes-recipes.js`
**Ubicación final:** `nutracore/server/routes/recipes.js`
**Descripción:** Rutas de NutraCore Lab (creador de recetas)
**Endpoints:**
- `GET /api/recipes` - Mis recetas (protegido)
- `GET /api/recipes/:id` - Detalle de receta (protegido)
- `POST /api/recipes` - Crear receta (protegido)
- `PUT /api/recipes/:id` - Actualizar receta (protegido)
- `DELETE /api/recipes/:id` - Eliminar receta (protegido)
- `POST /api/recipes/:id/favorite` - Toggle favorito (protegido)
- `GET /api/recipes/stats/summary` - Estadísticas (protegido)

---

### Middleware (1 archivo)

#### 19. `middleware-auth.js`
**Ubicación final:** `nutracore/server/middleware/auth.js`
**Descripción:** Middleware de autenticación JWT
**Funciones:**
- `protect()` - Middleware para proteger rutas
- `generateToken()` - Generar token JWT
**Uso:** Se aplica a rutas que requieren autenticación

---

### Utilidades (1 archivo)

#### 20. `seed-example.js`
**Ubicación final:** `nutracore/server/seed.js` ⚠️ **RENOMBRAR**
**Descripción:** Script para poblar la base de datos (OPCIONAL)
**Ejecutar:** `npm run seed` (después de configurar)
**Crea:**
- 1 usuario demo (email: demo@nutracore.com, password: demo123)
- 5 platos de ejemplo
- 3 noticias de ejemplo
- 1 receta de ejemplo
**⚠️ ADVERTENCIA:** Solo usar en desarrollo, borra datos existentes

---

## 💻 Frontend - React + JavaScript (4 archivos base + 10 componentes)

### Archivos Base - Ya Convertidos (4 archivos)

#### 21. `client-App.jsx`
**Ubicación final:** `nutracore/client/src/App.jsx` ⚠️ **Eliminar prefijo**
**Descripción:** Componente principal de React
**Contiene:**
- RouterProvider con configuración de rutas
- Punto de entrada de la aplicación

#### 22. `client-routes.jsx`
**Ubicación final:** `nutracore/client/src/routes.jsx`
**Descripción:** Configuración de React Router
**Contiene:**
- Definición de todas las rutas
- Importación de componentes
- Estructura de navegación

#### 23. `client-index.jsx`
**Ubicación final:** `nutracore/client/src/index.jsx`
**Descripción:** Punto de entrada de React
**Contiene:**
- Renderizado del componente App
- Configuración de React StrictMode

#### 24. `client-Root.jsx`
**Ubicación final:** `nutracore/client/src/components/Root.jsx`
**Descripción:** Componente raíz con layout base
**Contiene:**
- Outlet para rutas hijas
- Estructura HTML base

---

### Componentes - Requieren Conversión (10 archivos)

Estos archivos están en **TypeScript (.tsx)** en Figma Make.
Debes **copiarlos y convertirlos a JavaScript (.jsx)**.

Ver `CONVERSION_GUIDE.md` para instrucciones detalladas.

#### 25. `components/Home.tsx` → `Home.jsx`
**Ubicación final:** `nutracore/client/src/components/Home.jsx`
**Descripción:** Página de inicio
**Incluye:**
- Landing page
- Navegación principal
- Secciones hero, features, etc.

#### 26. `components/Navbar.tsx` → `Navbar.jsx`
**Ubicación final:** `nutracore/client/src/components/Navbar.jsx`
**Descripción:** Barra de navegación
**Incluye:**
- Logo NutraCore
- Enlaces de navegación
- Autenticación (login/logout)

#### 27. `components/Login.tsx` → `Login.jsx`
**Ubicación final:** `nutracore/client/src/components/Login.jsx`
**Descripción:** Página de inicio de sesión
**Incluye:**
- Formulario de login
- Validación
- Conexión con API

#### 28. `components/Register.tsx` → `Register.jsx`
**Ubicación final:** `nutracore/client/src/components/Register.jsx`
**Descripción:** Página de registro
**Incluye:**
- Formulario de registro
- Validación de datos
- Creación de usuario

#### 29. `components/Dashboard.tsx` → `Dashboard.jsx`
**Ubicación final:** `nutracore/client/src/components/Dashboard.jsx`
**Descripción:** Panel principal del usuario
**Incluye:**
- Resumen de estadísticas
- Gráficos de macronutrientes (Recharts)
- Objetivos y progreso

#### 30. `components/Catalog.tsx` → `Catalog.jsx`
**Ubicación final:** `nutracore/client/src/components/Catalog.jsx`
**Descripción:** Catálogo de platos
**Incluye:**
- Grid de platos
- Filtros por categoría
- Búsqueda
- Sistema de favoritos

#### 31. `components/News.tsx` → `News.jsx`
**Ubicación final:** `nutracore/client/src/components/News.jsx`
**Descripción:** Sección de noticias
**Incluye:**
- Feed de artículos
- Filtros por categoría
- Guardado de noticias

#### 32. `components/NutraCoreLab.tsx` → `NutraCoreLab.jsx`
**Ubicación final:** `nutracore/client/src/components/NutraCoreLab.jsx`
**Descripción:** Creador de recetas (Lab)
**Incluye:**
- Formulario de ingredientes
- Calculadora nutricional
- Gestión de recetas

#### 33. `components/Profile.tsx` → `Profile.jsx`
**Ubicación final:** `nutracore/client/src/components/Profile.jsx`
**Descripción:** Perfil de usuario
**Incluye:**
- Edición de datos personales
- Configuración de objetivos
- Estadísticas personales

#### 34. `components/NotFound.tsx` → `NotFound.jsx`
**Ubicación final:** `nutracore/client/src/components/NotFound.jsx`
**Descripción:** Página 404
**Incluye:**
- Mensaje de error
- Navegación de retorno

---

### Estilos (1 archivo)

#### 35. `styles/globals.css`
**Ubicación final:** `nutracore/client/src/styles/globals.css`
**Descripción:** Estilos globales de Tailwind CSS
**Contiene:**
- Configuración de Tailwind
- Variables CSS personalizadas
- Tipografías NutraCore
- Colores del tema
**⚠️ NO REQUIERE CONVERSIÓN** - Copiar tal cual

---

### Archivos de Configuración del Cliente (CREAR MANUALMENTE)

#### 36. `client/public/index.html`
**Descripción:** HTML base de la aplicación
**Instrucciones:** Ver `EXPORT_INSTRUCTIONS.md` para el contenido exacto

#### 37. `client/package.json`
**Descripción:** Dependencias y scripts del frontend
**Instrucciones:** Ver `EXPORT_INSTRUCTIONS.md` para el contenido exacto

#### 38. `client/.env`
**Descripción:** Variables de entorno del cliente
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 39. `client/tailwind.config.js`
**Descripción:** Configuración de Tailwind CSS
**Instrucciones:** Ver `EXPORT_INSTRUCTIONS.md` para el contenido exacto

---

## 📊 Resumen de Archivos

### Total: 39 archivos

#### Documentación: 6 archivos
- README, guías de instalación, conversión y estructura

#### Backend: 14 archivos
- Servidor, modelos, rutas, middleware, seed
- ⚠️ 3 archivos requieren renombrar (eliminar prefijos)

#### Frontend: 15 archivos
- 4 archivos base ya convertidos a JavaScript
- 10 componentes que requieren conversión TypeScript → JavaScript
- 1 archivo CSS (sin conversión)

#### Configuración: 4 archivos
- Crear manualmente según instrucciones

---

## ✅ Checklist de Exportación

### Fase 1: Preparación
- [ ] Leído `README-EXPORT.md`
- [ ] Leído `EXPORT_INSTRUCTIONS.md`
- [ ] Instalado Node.js
- [ ] Instalado MongoDB
- [ ] Creado estructura de carpetas

### Fase 2: Backend
- [ ] Copiado `server.js`
- [ ] Copiado y renombrado `server-package.json` → `package.json`
- [ ] Copiado y renombrado `server-env-example.txt` → `.env.example`
- [ ] Creado `.env` con valores reales
- [ ] Copiados 4 modelos (eliminando prefijo `models-`)
- [ ] Copiadas 5 rutas (eliminando prefijo `routes-`)
- [ ] Copiado middleware (eliminando prefijo `middleware-`)
- [ ] (Opcional) Copiado seed (renombrado a `seed.js`)
- [ ] Ejecutado `npm install` en `/server`

### Fase 3: Frontend
- [ ] Copiados 4 archivos base (eliminando prefijo `client-`)
- [ ] Convertidos 10 componentes de .tsx a .jsx
- [ ] Copiado `styles/globals.css`
- [ ] Creado `public/index.html`
- [ ] Creado `package.json`
- [ ] Creado `.env`
- [ ] Creado `tailwind.config.js`
- [ ] Ejecutado `npm install` en `/client`

### Fase 4: Verificación
- [ ] Backend inicia sin errores (`npm run dev`)
- [ ] Frontend inicia sin errores (`npm start`)
- [ ] MongoDB conectado
- [ ] Puedo acceder a http://localhost:3000
- [ ] Puedo navegar por la aplicación

### Fase 5: Datos (Opcional)
- [ ] Ejecutado seed (`npm run seed`)
- [ ] Puedo login con demo@nutracore.com / demo123
- [ ] Veo platos y noticias de ejemplo

---

## 🆘 Ayuda y Recursos

### ¿Necesitas ayuda con...?

**Instalación:**
→ Ver `INSTALLATION_GUIDE.md`

**Conversión TypeScript → JavaScript:**
→ Ver `CONVERSION_GUIDE.md`

**Estructura del proyecto:**
→ Ver `PROJECT_STRUCTURE.md`

**Paso a paso de exportación:**
→ Ver `EXPORT_INSTRUCTIONS.md`

**Resumen general:**
→ Ver `README-EXPORT.md`

---

## 📞 Archivos por Prioridad

### 🔴 CRÍTICOS (Leer primero)
1. `README-EXPORT.md`
2. `EXPORT_INSTRUCTIONS.md`

### 🟡 IMPORTANTES (Consultar durante exportación)
3. `CONVERSION_GUIDE.md`
4. `INSTALLATION_GUIDE.md`

### 🟢 REFERENCIA (Consultar cuando sea necesario)
5. `PROJECT_STRUCTURE.md`
6. `FILES_INDEX.md` (este archivo)

---

¡Éxito con tu exportación y TFG! 🚀

**Siguiente paso:** Abre `README-EXPORT.md`
