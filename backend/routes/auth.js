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
    const { email, password, name, age, gender, height, weight, goals } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona email, contraseña y nombre'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    const user = await User.create({
      email,
      password,
      name,
      age,
      gender,
      height,
      weight,
      goals
    });

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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona email y contraseña'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Tu cuenta ha sido desactivada'
      });
    }

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
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del usuario'
    });
  }
});

router.post('/logout', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

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
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
    });
  }
});

module.exports = router;
