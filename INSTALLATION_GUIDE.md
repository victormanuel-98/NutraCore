# 🚀 Guía de Instalación NutraCore

## Paso 1: Preparar el Entorno

### Instalar Node.js
1. Descarga Node.js desde https://nodejs.org/ (versión LTS recomendada)
2. Verifica la instalación:
```bash
node --version
npm --version
```

### Instalar MongoDB
**Windows:**
1. Descarga MongoDB Community Server desde https://www.mongodb.com/try/download/community
2. Sigue el asistente de instalación
3. Inicia MongoDB:
```bash
# Como servicio (se instala automáticamente)
# O manualmente:
mongod
```

**Mac (con Homebrew):**
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

Verifica que MongoDB está corriendo:
```bash
mongosh
# o
mongo
```

## Paso 2: Crear Estructura de Carpetas

```bash
# Crea la carpeta principal del proyecto
mkdir nutracore
cd nutracore

# Crea las carpetas para frontend y backend
mkdir client
mkdir server
```

## Paso 3: Copiar Archivos del Proyecto

### 📂 Copiar archivos de Figma Make:

Copia los siguientes archivos de Figma Make a tu proyecto local:

#### **Carpeta `client/`:**
```
client/
├── src/
│   ├── components/
│   │   ├── Catalog.jsx (convertido de Catalog.tsx)
│   │   ├── Dashboard.jsx (convertido de Dashboard.tsx)
│   │   ├── Home.jsx (convertido de Home.tsx)
│   │   ├── Login.jsx (convertido de Login.tsx)
│   │   ├── Navbar.jsx (convertido de Navbar.tsx)
│   │   ├── News.jsx (convertido de News.tsx)
│   │   ├── NotFound.jsx (convertido de NotFound.tsx)
│   │   ├── NutraCoreLab.jsx (convertido de NutraCoreLab.tsx)
│   │   ├── Profile.jsx (convertido de Profile.tsx)
│   │   ├── Register.jsx (convertido de Register.tsx)
│   │   └── Root.jsx (convertido de Root.tsx)
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx (convertido de App.tsx)
│   ├── routes.jsx (convertido de routes.tsx)
│   └── index.jsx (NUEVO - lo crearemos)
├── public/
│   └── index.html (NUEVO - lo crearemos)
└── package.json (NUEVO - lo crearemos)
```

#### **Carpeta `server/`:**
Todos los archivos del backend se crearán desde cero (los generaré a continuación).

## Paso 4: Configurar el Backend

### 4.1 Crear package.json del servidor
```bash
cd server
npm init -y
```

### 4.2 Instalar dependencias del backend
```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 4.3 Crear archivo .env
Crea un archivo `.env` en la carpeta `server/` con:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutracore
JWT_SECRET=nutracore_secret_key_2026_tfg_muy_segura
NODE_ENV=development
```

### 4.4 Actualizar package.json del servidor
Edita `server/package.json` para añadir los scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  }
}
```

## Paso 5: Configurar el Frontend

### 5.1 Crear la aplicación React
```bash
cd ../client
npx create-react-app .
```

**IMPORTANTE:** Si `create-react-app` da problemas, usa:
```bash
npx create-react-app@latest .
```

### 5.2 Instalar dependencias adicionales del frontend
```bash
npm install react-router-dom lucide-react recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5.3 Configurar Tailwind CSS v4
Reemplaza el contenido de `src/index.css` o `src/styles/globals.css` con el archivo que tienes de Figma Make.

### 5.4 Crear archivo .env del frontend
Crea un archivo `.env` en la carpeta `client/`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5.5 Reemplazar archivos
- Reemplaza `src/App.js` con `App.jsx` convertido
- Crea los archivos en `src/components/` con los archivos .jsx convertidos
- Reemplaza `src/index.js` con el nuevo `index.jsx` que crearemos

## Paso 6: Iniciar la Aplicación

### 6.1 Iniciar MongoDB
Asegúrate de que MongoDB está corriendo:
```bash
# Windows (si no está como servicio)
mongod

# Mac/Linux
sudo systemctl start mongodb
# o
brew services start mongodb-community
```

### 6.2 Iniciar el Backend
```bash
# En una terminal, desde la carpeta server/
cd server
npm run dev
```

Deberías ver:
```
✅ Servidor corriendo en puerto 5000
✅ MongoDB conectado exitosamente
```

### 6.3 Iniciar el Frontend
```bash
# En OTRA terminal, desde la carpeta client/
cd client
npm start
```

La aplicación se abrirá automáticamente en http://localhost:3000

## ✅ Verificación

Tu aplicación debería estar funcionando si ves:

1. **Backend:** 
   - Terminal muestra "Servidor corriendo en puerto 5000"
   - Terminal muestra "MongoDB conectado"

2. **Frontend:**
   - Navegador abre http://localhost:3000
   - Ves la página de inicio de NutraCore
   - No hay errores en la consola del navegador

## 🔧 Solución de Problemas Comunes

### Error: "MongoDB connection failed"
```bash
# Verifica que MongoDB está corriendo
mongosh

# Si no funciona, inicia MongoDB
mongod
```

### Error: "Port 3000 already in use"
```bash
# Mata el proceso en el puerto 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Error: "Cannot find module..."
```bash
# Reinstala las dependencias
cd client
rm -rf node_modules package-lock.json
npm install

cd ../server
rm -rf node_modules package-lock.json
npm install
```

### Error: CORS
Asegúrate de que en `server/server.js` está configurado CORS:
```javascript
app.use(cors());
```

## 📝 Próximos Pasos

Una vez todo esté funcionando:

1. **Poblar la base de datos:**
```bash
cd server
npm run seed
```

2. **Registrar un usuario** en http://localhost:3000/register

3. **Explorar todas las funcionalidades**

4. **Personalizar** según necesites para tu TFG

## 📞 Archivos que Generaré a Continuación

Te crearé todos los archivos necesarios:
- ✅ Configuración del proyecto
- ⏳ Backend completo (server/)
- ⏳ Archivos convertidos a JavaScript (client/)
- ⏳ Archivos de configuración (package.json, etc.)
- ⏳ Script de seed para base de datos

¡Vamos a generarlos!
