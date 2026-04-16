/**
 * Rutas de Autenticación
 * 
 * Endpoints para registro, login y gestión de autenticación
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, age, gender, height, weight } = req.body;

        // Validar campos requeridos
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona email, contraseña y nombre'
            });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const user = await User.create({
            email,
            password,
            name,
            age,
            gender,
            height,
            weight
        });

        // Generar token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: user.toPublicProfile(),
                token
            },
            message: 'Usuario registrado exitosamente'
        });
    } catch (error) {
        console.error('Error en registro:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona email y contraseña'
            });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verificar que la cuenta esté activa
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Tu cuenta ha sido desactivada'
            });
        }

        // Generar token
        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user: user.toPublicProfile(),
                token
            },
            message: 'Inicio de sesión exitoso'
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites', 'name image nutrition category')
            .populate('savedNews', 'title summary image category');

        res.json({
            success: true,
            data: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener información del usuario'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (cliente debe eliminar token)
 * @access  Private
 */
router.post('/logout', protect, async (req, res) => {
    // En JWT, el logout se maneja del lado del cliente eliminando el token
    // Aquí solo confirmamos la acción
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona la contraseña actual y la nueva'
            });
        }

        const user = await User.findById(req.user._id);

        // Verificar contraseña actual
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
});

module.exports = router;
