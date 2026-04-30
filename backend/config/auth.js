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
  if (!user) return null;

  if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
    const error = new Error('Token invalidado');
    error.name = 'TokenVersionError';
    throw error;
  }

  return user;
};

const protect = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({ success: false, error: 'No se proporcionó token de autenticación' });
  }

  try {
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Cuenta desactivada' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    }

    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
};

const optionalProtect = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) return next();

  try {
    const user = await getUserFromToken(token);
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore
  }

  return next();
};

const generateToken = (user) => {
  const isAdmin = user?.role === 'admin';
  const expiresIn = isAdmin ? '12h' : '30d';
  return jwt.sign(
    { id: user._id || user.id, tokenVersion: user.tokenVersion || 0, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'No tienes permisos para realizar esta acción' });
  }

  return next();
};

const requireAdmin = authorizeRoles('admin');

module.exports = {
  protect,
  optionalProtect,
  generateToken,
  authorizeRoles,
  requireAdmin
};
