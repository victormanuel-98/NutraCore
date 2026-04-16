# 📦 NutraCore - Exportación Completa para VSCode

## 🎯 Resumen Ejecutivo

Has desarrollado **NutraCore** en Figma Make y ahora está listo para exportarse a VSCode para continuar el desarrollo de tu TFG.

### Tecnologías Implementadas:
- ✅ **HTML5** - Estructura semántica
- ✅ **CSS3** - Estilos con Tailwind CSS
- ✅ **JavaScript** - Lógica de aplicación (React)
- ✅ **React** - Framework frontend
- ✅ **MongoDB** - Base de datos NoSQL

---

## 📁 Archivos Creados para Ti

### 📘 Documentación (4 archivos)
1. **`EXPORT_INSTRUCTIONS.md`** ⭐ **EMPIEZA AQUÍ**
   - Instrucciones completas paso a paso
   - Cómo copiar todos los archivos
   - Cómo configurar el proyecto

2. **`PROJECT_STRUCTURE.md`**
   - Estructura completa del proyecto
   - Explicación de cada carpeta
   - Endpoints de la API

3. **`INSTALLATION_GUIDE.md`**
   - Guía de instalación detallada
   - Instalación de MongoDB
   - Troubleshooting

4. **`CONVERSION_GUIDE.md`**
   - Cómo convertir TypeScript a JavaScript
   - Ejemplos de conversión
   - Reglas y mejores prácticas

### 🔧 Backend Completo (14 archivos)

#### Configuración
- `server.js` - Servidor Express principal
- `server-package.json` - Dependencias (renombrar a package.json)
- `server-env-example.txt` - Variables de entorno

#### Modelos MongoDB (4 archivos)
- `models-User.js` - Usuarios
- `models-Dish.js` - Catálogo de platos
- `models-News.js` - Noticias
- `models-Recipe.js` - Recetas (NutraCore Lab)

#### Rutas API (5 archivos)
- `routes-auth.js` - Autenticación (login/register)
- `routes-dishes.js` - Platos y favoritos
- `routes-news.js` - Noticias y artículos
- `routes-users.js` - Perfil y configuración
- `routes-recipes.js` - Creador de recetas

#### Middleware
- `middleware-auth.js` - Autenticación JWT

### 💻 Frontend (4 archivos base + 10 componentes)

#### Ya convertidos a JavaScript
- `client-App.jsx` - Componente principal
- `client-routes.jsx` - Configuración de rutas
- `client-index.jsx` - Punto de entrada
- `client-Root.jsx` - Componente raíz

#### Componentes a convertir (están en Figma Make)
Debes copiar y convertir de `.tsx` a `.jsx`:
- `components/Home.tsx` → Home.jsx
- `components/Login.tsx` → Login.jsx
- `components/Register.tsx` → Register.jsx
- `components/Dashboard.tsx` → Dashboard.jsx
- `components/Catalog.tsx` → Catalog.jsx
- `components/News.tsx` → News.jsx
- `components/NutraCoreLab.tsx` → NutraCoreLab.jsx
- `components/Profile.tsx` → Profile.jsx
- `components/NotFound.tsx` → NotFound.jsx
- `components/Navbar.tsx` → Navbar.jsx

#### Estilos
- `styles/globals.css` - Ya está listo para copiar

---

## 🚀 Inicio Rápido (3 pasos)

### 1️⃣ Lee la Documentación
```
Abre: EXPORT_INSTRUCTIONS.md
```
👆 Este archivo te guía paso a paso

### 2️⃣ Crea la Estructura
```bash
mkdir nutracore && cd nutracore
mkdir server client
cd server && mkdir config models routes middleware
cd ../client && mkdir src public
cd src && mkdir components styles
```

### 3️⃣ Copia los Archivos
Sigue las instrucciones de `EXPORT_INSTRUCTIONS.md` para copiar cada archivo a su ubicación.

---

## 📊 Estructura Final del Proyecto

```
nutracore/
│
├── server/                          # Backend Node.js + Express + MongoDB
│   ├── config/
│   ├── models/
│   │   ├── User.js
│   │   ├── Dish.js
│   │   ├── News.js
│   │   └── Recipe.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dishes.js
│   │   ├── news.js
│   │   ├── users.js
│   │   └── recipes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── client/                          # Frontend React + JavaScript
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Catalog.jsx
    │   │   ├── News.jsx
    │   │   ├── NutraCoreLab.jsx
    │   │   ├── Profile.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Root.jsx
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   ├── routes.jsx
    │   └── index.jsx
    ├── package.json
    ├── tailwind.config.js
    └── .env
```

---

## 🎓 Características de NutraCore

### Funcionalidades Implementadas

#### 🔐 Autenticación
- Registro de usuarios con validación
- Login con JWT
- Protección de rutas privadas
- Gestión de sesión

#### 📊 Dashboard
- Vista general de progreso
- Gráficos de macronutrientes
- Estadísticas personales
- Objetivos nutricionales

#### 🍽️ Catálogo de Platos
- Listado completo de platos
- Filtros por categoría
- Búsqueda avanzada
- Sistema de favoritos
- Información nutricional detallada

#### 🧪 NutraCore Lab
- Creador interactivo de recetas
- Calculadora de calorías
- Análisis nutricional automático
- Gestión de ingredientes

#### 📰 Noticias
- Feed de artículos sobre nutrición
- Filtrado por categoría
- Sistema de guardado
- Interacción (likes, compartir)

#### 👤 Perfil de Usuario
- Gestión de datos personales
- Configuración de objetivos
- Preferencias dietéticas
- Estadísticas de uso

---

## 🔑 API Endpoints Disponibles

### Autenticación
```
POST   /api/auth/register      # Registrar usuario
POST   /api/auth/login         # Iniciar sesión
GET    /api/auth/me            # Usuario actual
POST   /api/auth/logout        # Cerrar sesión
PUT    /api/auth/change-password  # Cambiar contraseña
```

### Platos
```
GET    /api/dishes             # Listar platos (con filtros)
GET    /api/dishes/:id         # Detalle de plato
POST   /api/dishes/:id/favorite  # Toggle favorito
GET    /api/dishes/user/favorites  # Mis favoritos
GET    /api/dishes/categories/list  # Categorías
```

### Noticias
```
GET    /api/news               # Listar noticias
GET    /api/news/:id           # Detalle noticia
POST   /api/news/:id/save      # Guardar noticia
POST   /api/news/:id/like      # Like a noticia
POST   /api/news/:id/share     # Compartir noticia
GET    /api/news/user/saved    # Noticias guardadas
```

### Usuario/Perfil
```
GET    /api/users/profile      # Obtener perfil
PUT    /api/users/profile      # Actualizar perfil
PUT    /api/users/goals        # Actualizar objetivos
GET    /api/users/stats        # Estadísticas
PUT    /api/users/preferences  # Preferencias dietéticas
DELETE /api/users/account      # Desactivar cuenta
```

### Recetas (Lab)
```
GET    /api/recipes            # Mis recetas
GET    /api/recipes/:id        # Detalle receta
POST   /api/recipes            # Crear receta
PUT    /api/recipes/:id        # Actualizar receta
DELETE /api/recipes/:id        # Eliminar receta
POST   /api/recipes/:id/favorite  # Toggle favorito
GET    /api/recipes/stats/summary  # Estadísticas
```

---

## 💾 Base de Datos MongoDB

### Colecciones Implementadas

#### `users`
- Datos de autenticación (email, password hash)
- Información personal (nombre, edad, género, peso, altura)
- Objetivos nutricionales
- Favoritos y guardados
- Preferencias dietéticas

#### `dishes`
- Información del plato
- Datos nutricionales
- Ingredientes e instrucciones
- Categoría y etiquetas
- Popularidad (favoritos, vistas)

#### `news`
- Artículos y noticias
- Contenido completo
- Autor y metadata
- Métricas (vistas, likes, compartidos)

#### `recipes`
- Recetas creadas por usuarios
- Ingredientes con nutrición
- Cálculos nutricionales automáticos
- Categorización y notas

---

## 🎨 Diseño y Estilo

### Paleta de Colores
- **Principal**: Blanco (#FFFFFF)
- **Acento**: Rosa NutraCore (#C41D63)
- **Texto**: Gris oscuro (#1a1a1a)
- **Fondo**: Grises suaves

### Tipografías
- **Logo**: Gajraj One
- **Texto general**: Inter
- **Eslogan**: Bitcount Single
- **Navbar**: ByteSized

### Responsive Design
- ✅ Mobile-first
- ✅ Tablet optimizado
- ✅ Desktop completo
- ✅ Navegación adaptativa

---

## 📖 Para tu TFG

### Documentación Académica

Tu proyecto incluye:

1. **Documentación técnica completa**
   - Arquitectura del sistema
   - Diagramas de estructura
   - Explicación de tecnologías

2. **Código comentado y limpio**
   - Buenas prácticas de desarrollo
   - Nomenclatura clara
   - Separación de responsabilidades

3. **API RESTful bien diseñada**
   - Endpoints documentados
   - Respuestas consistentes
   - Manejo de errores

4. **Seguridad implementada**
   - Autenticación JWT
   - Encriptación de contraseñas (bcrypt)
   - Validación de datos

5. **Base de datos bien estructurada**
   - Modelos relacionales
   - Validaciones
   - Índices optimizados

### Justificación de Tecnologías

**¿Por qué React?**
- Componentes reutilizables
- Virtual DOM para rendimiento
- Gran comunidad y ecosistema

**¿Por qué MongoDB?**
- Flexibilidad en esquemas
- Escalabilidad horizontal
- Ideal para datos no estructurados

**¿Por qué Node.js/Express?**
- JavaScript en backend y frontend
- Asíncrono y eficiente
- Gran cantidad de librerías

**¿Por qué JWT?**
- Stateless (no sesiones en servidor)
- Escalable
- Estándar de la industria

---

## ✅ Checklist de Exportación

Antes de empezar a trabajar en VSCode, asegúrate de tener:

### Software Necesario
- [ ] Node.js instalado (v16+)
- [ ] MongoDB instalado y corriendo
- [ ] VSCode instalado
- [ ] Git instalado (opcional)

### Archivos del Proyecto
- [ ] Todos los archivos del backend copiados
- [ ] Todos los archivos del frontend copiados
- [ ] Archivos de configuración creados
- [ ] Variables de entorno configuradas

### Dependencias
- [ ] `npm install` ejecutado en `/server`
- [ ] `npm install` ejecutado en `/client`
- [ ] No hay errores de dependencias

### Verificación
- [ ] Backend corre en puerto 5000
- [ ] Frontend corre en puerto 3000
- [ ] MongoDB conectado exitosamente
- [ ] No hay errores en consola
- [ ] Puedes navegar por la aplicación

---

## 🆘 Ayuda Rápida

### ¿Por dónde empiezo?
👉 Abre `EXPORT_INSTRUCTIONS.md` y sigue los pasos

### ¿Cómo convierto TypeScript a JavaScript?
👉 Lee `CONVERSION_GUIDE.md` con ejemplos

### ¿Cómo instalo MongoDB?
👉 Consulta `INSTALLATION_GUIDE.md` paso a paso

### ¿Qué hace cada archivo del backend?
👉 Revisa `PROJECT_STRUCTURE.md`

### ¿Tengo un error al ejecutar?
👉 Busca en la sección "Troubleshooting" de `INSTALLATION_GUIDE.md`

---

## 📞 Contacto y Recursos

### Recursos de Aprendizaje
- **React**: https://react.dev/learn
- **Express**: https://expressjs.com/es/starter/installing.html
- **MongoDB**: https://www.mongodb.com/es/docs/manual/tutorial/
- **Mongoose**: https://mongoosejs.com/docs/guide.html

### Comunidades
- Stack Overflow (preguntas técnicas)
- GitHub (ejemplos de código)
- Reddit r/reactjs, r/node, r/mongodb

---

## 🎉 ¡Estás listo!

Tienes todo lo necesario para:
1. ✅ Exportar NutraCore a VSCode
2. ✅ Trabajar con HTML5, CSS3, JavaScript, React y MongoDB
3. ✅ Continuar el desarrollo de tu TFG
4. ✅ Presentar un proyecto profesional y completo

### Siguiente Paso:
```
Abre: EXPORT_INSTRUCTIONS.md
```

**¡Mucho éxito con tu TFG! 🚀**

---

*NutraCore - Dashboard de Nutrición Inteligente*
*Desarrollado con ❤️ para tu Trabajo Final de Grado 2026*
