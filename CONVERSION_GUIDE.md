# Guía de Conversión TypeScript a JavaScript

## Archivos Ya Convertidos

### Frontend (client/src/)

- ✅ `App.jsx` - Punto de entrada de la aplicación
- ✅ `routes.jsx` - Configuración de React Router
- ✅ `index.jsx` - Renderizado de React
- ✅ `components/Root.jsx` - Componente raíz

### Backend (server/)

- ✅ `server.js` - Servidor Express principal
- ✅ `models/User.js` - Modelo de Usuario (MongoDB)
- ✅ `models/Dish.js` - Modelo de Plato
- ✅ `models/News.js` - Modelo de Noticia
- ✅ `models/Recipe.js` - Modelo de Receta
- ✅ `middleware/auth.js` - Middleware de autenticación JWT
- ✅ `routes/auth.js` - Rutas de autenticación
- ✅ `routes/dishes.js` - Rutas de platos
- ✅ `routes/news.js` - Rutas de noticias
- ✅ `routes/users.js` - Rutas de usuario/perfil
- ✅ `routes/recipes.js` - Rutas de recetas
- ✅ `package.json` - Dependencias del servidor
- ✅ `.env.example` - Variables de entorno

## Archivos Pendientes de Conversión

Los siguientes archivos de Figma Make deben convertirse de TypeScript (.tsx) a JavaScript (.jsx):

### Componentes Principales

#### 1. `components/Home.jsx`

**Cambios necesarios:**

- Eliminar tipos TypeScript
- Cambiar extensión de `.tsx` a `.jsx`
- Mantener toda la funcionalidad

**Ejemplo de conversión:**

```typescript
// ANTES (TypeScript .tsx)
interface HomeProps {
  title: string;
}

export function Home({ title }: HomeProps) {
  // ...
}
```

```javascript
// DESPUÉS (JavaScript .jsx)
export function Home({ title }) {
  // ...
}
```

#### 2. `components/Navbar.jsx`

- Copiar contenido de `Navbar.tsx`
- Eliminar todas las anotaciones de tipos (`: string`, `: number`, etc.)
- Eliminar interfaces (`interface NavbarProps { }`)
- Guardar como `.jsx`

#### 3. `components/Login.jsx`

- Copiar de `Login.tsx`
- Eliminar tipos de formularios
- Eliminar interfaces de estado
- Convertir `useState<Type>()` a `useState()`

#### 4. `components/Register.jsx`

- Similar a Login
- Eliminar tipos de validación
- Mantener lógica de registro

#### 5. `components/Dashboard.jsx`

- Eliminar interfaces de datos
- Convertir tipos de charts a JavaScript puro

#### 6. `components/Catalog.jsx`

- Eliminar tipos de filtros
- Eliminar tipos de dishes/platos

#### 7. `components/NutraCoreLab.jsx`

- Eliminar tipos de ingredientes
- Eliminar tipos de nutrición
- Mantener cálculos nutricionales

#### 8. `components/News.jsx`

- Eliminar tipos de articles
- Eliminar tipos de filtros

#### 9. `components/Profile.jsx`

- Eliminar tipos de usuario
- Eliminar tipos de objetivos

#### 10. `components/NotFound.jsx`

- Componente simple, conversión directa

## Reglas Generales de Conversión

### 1. Imports

✅ **NO cambiar:**

```javascript
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart } from "lucide-react";
```

### 2. Interfaces y Types

❌ **ELIMINAR completamente:**

```typescript
// ELIMINAR
interface User {
  name: string;
  age: number;
}

type DishCategory = "breakfast" | "lunch";
```

### 3. Props

**ANTES:**

```typescript
export function Component({ name, age }: { name: string; age: number }) {
```

**DESPUÉS:**

```javascript
export function Component({ name, age }) {
```

### 4. useState

**ANTES:**

```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
```

**DESPUÉS:**

```javascript
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
```

### 5. Funciones

**ANTES:**

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
```

**DESPUÉS:**

```javascript
const handleSubmit = (e) => {
```

### 6. Event Handlers

**ANTES:**

```typescript
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
```

**DESPUÉS:**

```javascript
onChange={(e) => setName(e.target.value)}
```

## Pasos para Cada Archivo

1. **Abrir el archivo .tsx en Figma Make**
2. **Copiar todo el contenido**
3. **Crear nuevo archivo .jsx en tu VSCode**
4. **Pegar el contenido**
5. **Buscar y eliminar:**
   - Todas las `interface` declarations
   - Todas las `type` declarations
   - Todos los `: TipoAqui` después de variables
   - Todos los `<TipoAqui>` en generics
6. **Guardar el archivo**
7. **Verificar imports** - deben seguir funcionando igual

## Ejemplo Completo de Conversión

### ANTES (TypeScript):

```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // lógica
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />
    </form>
  );
}
```

### DESPUÉS (JavaScript):

```javascript
import { useState } from "react";
import { Link } from "react-router-dom";

export function Login({ onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // lógica
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />
    </form>
  );
}
```

## Archivos que NO Necesitan Conversión

### Mantener Como Están:

- ✅ `styles/globals.css` - CSS puro
- ✅ `public/index.html` - HTML puro
- ✅ Archivos en `/imports/` - Imágenes y assets
- ✅ `.env` - Variables de entorno
- ✅ `package.json` - Configuración

## Configuración Adicional Necesaria

### 1. `public/index.html`

Crear este archivo en `client/public/`:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#C41D63" />
    <meta
      name="description"
      content="NutraCore - Dashboard de Nutrición Inteligente"
    />
    <title>NutraCore | Tu Dashboard de Nutrición</title>
  </head>
  <body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 2. `client/package.json`

```json
{
  "name": "nutracore-client",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.300.0",
    "recharts": "^2.10.0"
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
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "react-scripts": "5.0.1"
  },
  "proxy": "http://localhost:5000"
}
```

### 3. `tailwind.config.js` (client/)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "nutracore-pink": "#C41D63",
      },
      fontFamily: {
        gajraj: ["Gajraj One", "cursive"],
        inter: ["Inter", "sans-serif"],
        bitcount: ["Bitcount Single", "monospace"],
        bytesized: ["ByteSized", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

## Verificación Final

Después de convertir todos los archivos, verifica:

1. ✅ No hay archivos `.tsx` o `.ts` en `/client/src/`
2. ✅ Todos los componentes son `.jsx` o `.js`
3. ✅ No quedan `interface` o `type` en ningún archivo
4. ✅ Los imports funcionan correctamente
5. ✅ No hay errores de compilación
6. ✅ La aplicación corre con `npm start`

## Notas Importantes

- **NO cambies** la lógica de ningún componente
- **NO cambies** los nombres de las funciones o variables
- **NO cambies** la estructura del JSX/HTML
- **SOLO elimina** las anotaciones de tipos TypeScript
- **Mantén** todos los comentarios útiles
- **Verifica** que los imports sigan siendo correctos

## Siguiente Paso

Una vez convertidos todos los archivos, podrás ejecutar:

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm start
```

¡Y NutraCore estará funcionando en JavaScript puro con MongoDB!
