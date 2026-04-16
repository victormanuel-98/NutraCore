/**
 * NutraCore - Servidor Backend
 *
 * Servidor Express con MongoDB para la aplicación NutraCore
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutracore';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado exitosamente');
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'NutraCore API',
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

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await mongoose.connection.close();
  console.log('MongoDB desconectado');
  process.exit(0);
});
