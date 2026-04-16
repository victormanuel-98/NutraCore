# 🚀 EMPIEZA AQUÍ - Exportación NutraCore

```
 _   _       _             ____
| \ | |_   _| |_ _ __ __ _/ ___|___  _ __ ___
|  \| | | | | __| '__/ _` | |   / _ \| '__/ _ \
| |\  | |_| | |_| | | (_| | |__| (_) | | |  __/
|_| \_|\__,_|\__|_|  \__,_|\____\___/|_|  \___|

Dashboard de Nutrición Inteligente
TFG 2026 - HTML5 | CSS3 | JavaScript | React | MongoDB
```

---

## 📍 Estás Aquí

Has desarrollado **NutraCore** en Figma Make y ahora vas a exportarlo a VSCode para continuar el desarrollo de tu TFG con la stack requerida:

✅ **HTML5** - Estructura semántica
✅ **CSS3** - Estilos con Tailwind
✅ **JavaScript** - Lógica de aplicación
✅ **React** - Framework frontend
✅ **MongoDB** - Base de datos NoSQL

---

## 🎯 Objetivo

Convertir el proyecto de Figma Make (TypeScript) a un proyecto standalone de VSCode (JavaScript) con backend completo.

---

## 📚 Ruta de 3 Pasos

### 🔴 PASO 1: Lee la Documentación (10 min)

#### A. Resumen General

```
Archivo: README-EXPORT.md
Tiempo: 5 minutos
Contenido: Qué has creado, qué archivos tienes, checklist
```

#### B. Instrucciones de Exportación

```
Archivo: EXPORT_INSTRUCTIONS.md
Tiempo: 5 minutos
Contenido: Cómo copiar cada archivo paso a paso
```

### 🟡 PASO 2: Exporta el Proyecto (30-45 min)

#### A. Crea la Estructura de Carpetas

```bash
mkdir nutracore && cd nutracore
mkdir server client
```

#### B. Copia los Archivos del Backend (14 archivos)

```
1. server.js
2. server-package.json → package.json (renombrar)
3. server-env-example.txt → .env.example (renombrar)
4-7. Modelos (User, Dish, News, Recipe)
8-12. Rutas (auth, dishes, news, users, recipes)
13. Middleware (auth)
14. Seed (opcional)
```

#### C. Copia los Archivos del Frontend (15 archivos)

```
Archivos ya convertidos (4):
1. client-App.jsx → App.jsx
2. client-routes.jsx → routes.jsx
3. client-index.jsx → index.jsx
4. client-Root.jsx → Root.jsx

Componentes a convertir (10):
5-14. Home, Navbar, Login, Register, Dashboard,
      Catalog, News, NutraCoreLab, Profile, NotFound
      (copiar de .tsx y convertir a .jsx)

Estilos (1):
15. styles/globals.css (copiar tal cual)
```

Ver `CONVERSION_GUIDE.md` para convertir TypeScript → JavaScript

#### D. Crea Archivos de Configuración (4 archivos)

```
1. client/public/index.html
2. client/package.json
3. client/.env
4. client/tailwind.config.js
```

Ver contenido exacto en `EXPORT_INSTRUCTIONS.md`

### 🟢 PASO 3: Ejecuta el Proyecto (10 min)

#### A. Instala Dependencias

```bash
# Backend
cd server
npm install

# Frontend (otra terminal)
cd ../client
npm install
```

#### B. Configura MongoDB

```bash
# Asegúrate de que MongoDB está corriendo
mongosh  # para verificar
```

#### C. Inicia la Aplicación

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

#### D. Verifica

```
✅ Backend: http://localhost:5000
✅ Frontend: http://localhost:3000
✅ MongoDB conectado (mensaje en terminal)
✅ Puedes navegar por la app
```

---

## 📁 Archivos Generados para Ti

### 📘 Documentación (6 archivos)

```
README-EXPORT.md           ⭐ Resumen ejecutivo
EXPORT_INSTRUCTIONS.md     ⭐ Instrucciones paso a paso
CONVERSION_GUIDE.md        📖 Convertir TypeScript → JavaScript
INSTALLATION_GUIDE.md      📖 Instalación detallada
PROJECT_STRUCTURE.md       📖 Estructura del proyecto
FILES_INDEX.md             📖 Índice de todos los archivos
```

### 🔧 Backend (14 archivos)

```
server.js                  ✅ Servidor Express
server-package.json        ✅ Dependencias
server-env-example.txt     ✅ Variables de entorno
models-User.js             ✅ Modelo Usuario
models-Dish.js             ✅ Modelo Plato
models-News.js             ✅ Modelo Noticia
models-Recipe.js           ✅ Modelo Receta
routes-auth.js             ✅ Rutas autenticación
routes-dishes.js           ✅ Rutas platos
routes-news.js             ✅ Rutas noticias
routes-users.js            ✅ Rutas usuario
routes-recipes.js          ✅ Rutas recetas
middleware-auth.js         ✅ Middleware JWT
seed-example.js            ✅ Datos de ejemplo
```

### 💻 Frontend (4 + 10 componentes)

```
Ya convertidos:
client-App.jsx             ✅ App principal
client-routes.jsx          ✅ Configuración rutas
client-index.jsx           ✅ Punto de entrada
client-Root.jsx            ✅ Componente raíz

A convertir (en Figma Make):
components/Home.tsx        🔄 → Home.jsx
components/Navbar.tsx      🔄 → Navbar.jsx
components/Login.tsx       🔄 → Login.jsx
components/Register.tsx    🔄 → Register.jsx
components/Dashboard.tsx   🔄 → Dashboard.jsx
components/Catalog.tsx     🔄 → Catalog.jsx
components/News.tsx        🔄 → News.jsx
components/NutraCoreLab.tsx 🔄 → NutraCoreLab.jsx
components/Profile.tsx     🔄 → Profile.jsx
components/NotFound.tsx    🔄 → NotFound.jsx

Estilos:
styles/globals.css         ✅ Copiar tal cual
```

---

## 🎓 Lo Que Has Construido

### Funcionalidades Completas

#### 🔐 Autenticación

- Registro de usuarios
- Login con JWT
- Rutas protegidas
- Gestión de sesión

#### 📊 Dashboard Interactivo

- Estadísticas personales
- Gráficos de macronutrientes
- Seguimiento de objetivos
- Progreso visual

#### 🍽️ Catálogo de Platos

- 5 platos de ejemplo (con seed)
- Filtros y búsqueda
- Sistema de favoritos
- Información nutricional completa

#### 🧪 NutraCore Lab

- Creador de recetas
- Calculadora nutricional
- Gestión de ingredientes
- Análisis automático

#### 📰 Noticias y Artículos

- Feed de contenido
- Categorías (nutrición, fitness, wellness)
- Sistema de guardado
- Interacciones (likes, compartir)

#### 👤 Perfil de Usuario

- Datos personales
- Objetivos nutricionales
- IMC automático
- Preferencias dietéticas

---

## 🏗️ Arquitectura del Proyecto

```
nutracore/
│
├── server/                  # Backend API
│   ├── models/             # Schemas MongoDB
│   ├── routes/             # Endpoints API
│   ├── middleware/         # Autenticación JWT
│   ├── server.js           # Servidor Express
│   ├── package.json        # Dependencias
│   └── .env                # Configuración
│
└── client/                  # Frontend React
    ├── public/             # HTML base
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── styles/         # CSS global
    │   ├── App.jsx         # App principal
    │   ├── routes.jsx      # Configuración rutas
    │   └── index.jsx       # Punto de entrada
    ├── package.json        # Dependencias
    └── .env                # API URL
```

---

## 🔑 Credenciales Demo (después del seed)

```
Email: demo@nutracore.com
Password: demo123

Ejecutar seed: npm run seed (desde /server)
```

---

## ⚠️ Importante: Conversión TypeScript → JavaScript

Los componentes en Figma Make están en **TypeScript (.tsx)**.
Debes **eliminar las anotaciones de tipos** al copiarlos.

### Ejemplo:

```typescript
// ANTES (TypeScript)
interface User {
  name: string;
  age: number;
}

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  // ...
}
```

```javascript
// DESPUÉS (JavaScript)
export function Login({ onSuccess }) {
  const [user, setUser] = useState(null);
  // ...
}
```

**Ver `CONVERSION_GUIDE.md` para instrucciones completas.**

---

## ✅ Checklist Rápido

### Antes de Empezar

- [ ] Node.js instalado
- [ ] MongoDB instalado
- [ ] VSCode instalado

### Exportación

- [ ] Leído README-EXPORT.md
- [ ] Leído EXPORT_INSTRUCTIONS.md
- [ ] Creada estructura de carpetas
- [ ] Copiados archivos del backend
- [ ] Copiados archivos del frontend
- [ ] Convertidos componentes .tsx a .jsx
- [ ] Creados archivos de configuración

### Ejecución

- [ ] npm install en /server
- [ ] npm install en /client
- [ ] MongoDB corriendo
- [ ] Backend inicia (puerto 5000)
- [ ] Frontend inicia (puerto 3000)
- [ ] App funciona correctamente

### Opcional

- [ ] Ejecutado seed para datos de ejemplo
- [ ] Probado login con usuario demo

---

## 🆘 ¿Problemas?

### Error: "Cannot find module..."

```bash
npm install  # en la carpeta correspondiente
```

### Error: "MongoDB connection failed"

```bash
mongosh  # verificar que MongoDB está corriendo
```

### Error: "Port already in use"

```bash
# Cambiar puerto en .env o matar proceso
```

### Error en conversión TypeScript

→ Ver `CONVERSION_GUIDE.md` con ejemplos

### Otros errores

→ Ver sección "Troubleshooting" en `INSTALLATION_GUIDE.md`

---

## 📞 Archivos de Ayuda

| Necesitas...              | Lee este archivo            |
| ------------------------- | --------------------------- |
| Resumen general           | `README-EXPORT.md`          |
| Instrucciones paso a paso | `EXPORT_INSTRUCTIONS.md` ⭐ |
| Convertir código          | `CONVERSION_GUIDE.md`       |
| Instalar requisitos       | `INSTALLATION_GUIDE.md`     |
| Entender estructura       | `PROJECT_STRUCTURE.md`      |
| Lista de archivos         | `FILES_INDEX.md`            |

---

## 🎯 Próximos Pasos

### 1. AHORA (0-1 hora)

- [ ] Lee `README-EXPORT.md`
- [ ] Lee `EXPORT_INSTRUCTIONS.md`
- [ ] Prepara tu entorno (Node.js, MongoDB, VSCode)

### 2. HOY (1-2 horas)

- [ ] Crea estructura de carpetas
- [ ] Copia archivos del backend
- [ ] Copia archivos del frontend
- [ ] Convierte componentes a JavaScript
- [ ] Instala dependencias

### 3. MAÑANA (30 min)

- [ ] Prueba la aplicación completa
- [ ] Ejecuta seed para datos de ejemplo
- [ ] Familiarízate con el código

### 4. ESTA SEMANA

- [ ] Personaliza diseño
- [ ] Añade más contenido
- [ ] Documenta para tu TFG

---

## 🎉 ¡Todo Listo!

Tienes **39 archivos** generados con:

- ✅ Backend completo (Express + MongoDB)
- ✅ Frontend completo (React + JavaScript)
- ✅ Documentación detallada
- ✅ Sistema de autenticación
- ✅ API RESTful funcional
- ✅ Diseño responsive
- ✅ Código limpio y comentado

### 🚀 Siguiente Paso:

```
Abre: README-EXPORT.md
```

---

**¡Mucho éxito con tu TFG NutraCore! 🎓💪**

_Dashboard de Nutrición Inteligente - 2026_
