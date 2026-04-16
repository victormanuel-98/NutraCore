/**
 * Middleware de Autenticación
 *
 * Verifica el token JWT en las peticiones protegidas
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  return user;
};

/**
 * Middleware para proteger rutas
 * Verifica que el usuario esté autenticado mediante JWT
 */
const protect = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No se proporcionó token de autenticación'
    });
  }

  try {
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'No autorizado'
    });
  }
};

/**
 * Middleware opcional.
 * Si el token existe y es válido, añade req.user.
 * Si no existe, continúa sin usuario.
 */
const optionalProtect = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return next();
  }

  try {
    const user = await getUserFromToken(token);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Ignoramos errores en modo opcional para permitir peticiones públicas.
  }

  return next();
};

/**
 * Generar token JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { protect, optionalProtect, generateToken };
