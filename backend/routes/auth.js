/**
 * Rutas de Autenticación
 *
 * Endpoints para registro, login y gestión de autenticación
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, protect } = require('../config/auth');
const { sendVerificationEmail } = require('../services/emailService');

const buildVerificationToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const buildAliasCandidate = () => `NutraUser${Math.floor(1000 + Math.random() * 9000)}`;
const buildUniqueAlias = async () => {
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = buildAliasCandidate();
    const exists = await User.exists({ name: candidate });
    if (!exists) return candidate;
  }
  return `NutraUser${String(Date.now()).slice(-4)}`;
};

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const sendVerificationEmailForUser = async (user) => {
  const rawToken = buildVerificationToken();
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Usamos findByIdAndUpdate para asegurar que se guarde sin interferencias de otros middlewares
  await User.findByIdAndUpdate(user._id, {
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires
  });

  const verifyUrl = `${getClientUrl()}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  await sendVerificationEmail({
    toEmail: user.email,
    userName: user.name,
    verifyUrl
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, age, gender, height, weight, goals } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona email y contraseña'
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    const rawToken = buildVerificationToken();
    const hashedToken = hashToken(rawToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const alias = await buildUniqueAlias();

    const user = await User.create({
      email: normalizedEmail,
      password,
      name: alias,
      age,
      gender,
      height,
      weight,
      goals,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expires
    });

    // REFUERZO: Forzar el guardado por si User.create falló en persistir esos campos específicos
    await User.updateOne({ _id: user._id }, {
      $set: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expires
      }
    });

    try {
      const verifyUrl = `${getClientUrl()}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
      await sendVerificationEmail({
        toEmail: user.email,
        userName: user.name,
        verifyUrl
      });
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({
        success: false,
        error: emailError.message || 'No se pudo enviar el correo de verificación'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        user: user.toPublicProfile()
      },
      message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.'
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
    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona email y contraseña'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
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

    if (!user.isEmailVerified && user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Debes verificar tu correo antes de iniciar sesión'
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
 * @route   GET /api/auth/verify-email
 * @desc    Verificar email mediante token
 * @access  Public
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Token o email no proporcionados'
      });
    }

    const rawToken = String(token || '').trim();
    const tokenHash = hashToken(rawToken);
    const normalizedEmail = String(email || '').toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'El enlace de verificación es inválido o ha caducado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Tu cuenta ha sido desactivada'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({
      success: true,
      data: {
        user: user.toPublicProfile(),
        token: generateToken(user._id)
      },
      message: 'Correo verificado correctamente. Accediendo a tu cuenta...'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al verificar el correo'
    });
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Reenviar correo de verificación
 * @access  Public
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No existe una cuenta con ese correo'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'La cuenta ya está verificada'
      });
    }

    await sendVerificationEmailForUser(user);

    return res.json({
      success: true,
      message: 'Correo de verificación reenviado'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'No se pudo reenviar el correo de verificación'
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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
    });
  }
});

module.exports = router;
