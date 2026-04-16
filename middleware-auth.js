/**
 * Middleware de Autenticación
 * 
 * Verifica el token JWT en las peticiones protegidas
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rutas
 * Verifica que el usuario esté autenticado mediante JWT
 */
const protect = async (req, res, next) => {
    let token;

    // Verificar si el token viene en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header: "Bearer TOKEN"
            token = req.headers.authorization.split(' ')[1];

            // Verificar y decodificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener usuario del token (sin incluir contraseña)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            // Verificar que el usuario esté activo
            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Cuenta desactivada'
                });
            }

            next();
        } catch (error) {
            console.error('Error en autenticación:', error.message);

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
    } else {
        return res.status(401).json({
            success: false,
            error: 'No se proporcionó token de autenticación'
        });
    }
};

/**
 * Generar token JWT
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Token válido por 30 días
    );
};

module.exports = { protect, generateToken };
