/**
 * NutraCore - Servidor Backend
 * 
 * Servidor Express con MongoDB para la aplicación NutraCore
 * TFG - Dashboard de Nutrición y Fitness
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear formularios

// Middleware de logging (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutracore';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'NutraCore API - Dashboard de Nutrición',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      dishes: '/api/dishes',
      news: '/api/news',
      users: '/api/users',
      recipes: '/api/recipes'
    }
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\n⚠️  Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ MongoDB desconectado');
  process.exit(0);
});
