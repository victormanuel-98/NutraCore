const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { mongoose } = require('./config/db');
const { rateLimit, readEnvLimit } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');
const reviewRoutes = require('./routes/reviews');
const docsRoutes = require('./routes/docs');
const { sendError } = require('./utils/http');

const parseAllowedOrigins = () =>
  String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const buildCorsMiddleware = () => {
  const allowedOrigins = parseAllowedOrigins();
  const isProd = process.env.NODE_ENV === 'production';

  // Dev fallback: permissive CORS if no allowlist provided.
  if (!isProd && allowedOrigins.length === 0) {
    return cors();
  }

  return cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'));
    }
  });
};

const parseTrustProxy = () => {
  const raw = String(process.env.TRUST_PROXY ?? '1').trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) return asNumber;
  return raw || 1;
};

const createApp = ({ mongooseRef = mongoose } = {}) => {
  const app = express();
  app.set('trust proxy', parseTrustProxy());

  const globalLimit = readEnvLimit('RATE_LIMIT_GLOBAL_WINDOW_MS', 'RATE_LIMIT_GLOBAL_MAX', 60 * 1000, 240);
  const authLimit = readEnvLimit('RATE_LIMIT_AUTH_WINDOW_MS', 'RATE_LIMIT_AUTH_MAX', 15 * 60 * 1000, 50);
  const usersLimit = readEnvLimit('RATE_LIMIT_USERS_WINDOW_MS', 'RATE_LIMIT_USERS_MAX', 60 * 1000, 120);
  const recipesLimit = readEnvLimit('RATE_LIMIT_RECIPES_WINDOW_MS', 'RATE_LIMIT_RECIPES_MAX', 60 * 1000, 180);
  const ingredientsLimit = readEnvLimit('RATE_LIMIT_INGREDIENTS_WINDOW_MS', 'RATE_LIMIT_INGREDIENTS_MAX', 60 * 1000, 90);
  const reviewsLimit = readEnvLimit('RATE_LIMIT_REVIEWS_WINDOW_MS', 'RATE_LIMIT_REVIEWS_MAX', 60 * 1000, 120);

  app.use(buildCorsMiddleware());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(
    mongoSanitize({
      replaceWith: '_'
    })
  );
  app.use(hpp());
  app.use(rateLimit({ keyPrefix: 'global', ...globalLimit }));

  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  app.use('/api/docs', docsRoutes);
  app.use('/api/auth', rateLimit({ keyPrefix: 'auth', ...authLimit }), authRoutes);
  app.use('/api/dishes', dishRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/users', rateLimit({ keyPrefix: 'users', ...usersLimit }), userRoutes);
  app.use('/api/recipes', rateLimit({ keyPrefix: 'recipes', ...recipesLimit }), recipeRoutes);
  app.use('/api/ingredients', rateLimit({ keyPrefix: 'ingredients', ...ingredientsLimit }), ingredientRoutes);
  app.use('/api/reviews', rateLimit({ keyPrefix: 'reviews', ...reviewsLimit }), reviewRoutes);

  app.get('/', (req, res) => {
    res.json({
      message: 'NutraCore API',
      version: '1.0.0',
      endpoints: {
        docs: '/api/docs',
        auth: '/api/auth',
        dishes: '/api/dishes',
        news: '/api/news',
        users: '/api/users',
        recipes: '/api/recipes',
        ingredients: '/api/ingredients',
        reviews: '/api/reviews'
      }
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      mongodb: mongooseRef.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use((req, res) => {
    sendError(res, 404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada', { path: req.path });
  });

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    const code = err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
    const details = process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;
    sendError(res, status, code, err.message || 'Error interno del servidor', details);
  });

  return app;
};

module.exports = { createApp };
