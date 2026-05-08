/**
 * Rutas de Noticias
 * 
 * Endpoints para art?culos y noticias de nutrici?n
 */

const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User');
const { protect } = require('../config/auth');
const { validateObjectIdParam } = require('../middleware/validation');
const { sendNewsletterSubscriptionEmail } = require('../services/emailService');
const { validateEmailAddress } = require('../utils/emailValidation');

/**
 * @route   GET /api/news
 * @desc    Obtener todas las noticias con filtros
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      tags,
      featured,
      status = 'published',
      sort = '-publishedAt',
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtro
    const filter = { status };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    if (featured) {
      filter.featured = featured === 'true';
    }

    // Calcular paginaci?n
    const skip = (Number(page) - 1) * Number(limit);

    // Ejecutar query
    const news = await News.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Contar total
    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener noticias'
    });
  }
});

/**
 * @route   GET /api/news/featured
 * @desc    Obtener noticias destacadas
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const news = await News.find({ 
      featured: true, 
      status: 'published' 
    })
      .limit(3)
      .sort('-publishedAt');

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error al obtener noticias destacadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener noticias destacadas'
    });
  }
});

/**
 * @route   POST /api/news/newsletter/subscribe
 * @desc    Enviar confirmacion de suscripcion al boletin
 * @access  Public
 */
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { isValid, normalizedEmail, error } = validateEmailAddress(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error
      });
    }

    await sendNewsletterSubscriptionEmail({ toEmail: normalizedEmail });

    return res.json({
      success: true,
      message: 'Suscripcion registrada y correo enviado'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'No se pudo enviar el correo de suscripcion'
    });
  }
});

/**
 * @route   GET /api/news/:id
 * @desc    Obtener una noticia por ID
 * @access  Public
 */
router.get('/:id', validateObjectIdParam('id'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    // Incrementar vistas
    await news.incrementViews();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al obtener noticia'
    });
  }
});

/**
 * @route   POST /api/news/:id/save
 * @desc    Guardar/quitar noticia
 * @access  Private
 */
router.post('/:id/save', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    const user = await User.findById(req.user._id);

    // Verificar si ya est? guardada
    const isSaved = user.savedNews.includes(news._id);

    if (isSaved) {
      // Quitar de guardadas
      user.savedNews = user.savedNews.filter(
        saved => saved.toString() !== news._id.toString()
      );
      await news.removeSave();
    } else {
      // Agregar a guardadas
      user.savedNews.push(news._id);
      await news.addSave();
    }

    await user.save();

    res.json({
      success: true,
      data: {
        isSaved: !isSaved,
        savesCount: news.saves
      },
      message: isSaved ? 'Quitado de guardados' : 'Guardado exitosamente'
    });
  } catch (error) {
    console.error('Error al guardar noticia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al guardar noticia'
    });
  }
});

/**
 * @route   POST /api/news/:id/like
 * @desc    Dar/quitar like a noticia
 * @access  Private
 */
router.post('/:id/like', validateObjectIdParam('id'), protect, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    // Simplificado: solo incrementar likes
    // En una app real, guardar?as qu? usuarios dieron like
    await news.addLike();

    res.json({
      success: true,
      data: {
        likesCount: news.likes
      },
      message: 'Like agregado'
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({
      success: false,
      error: 'Error al dar like'
    });
  }
});

/**
 * @route   POST /api/news/:id/share
 * @desc    Incrementar contador de compartidos
 * @access  Public
 */
router.post('/:id/share', validateObjectIdParam('id'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    await news.incrementShares();

    res.json({
      success: true,
      data: {
        sharesCount: news.shares
      },
      message: 'Compartido registrado'
    });
  } catch (error) {
    console.error('Error al compartir:', error);
    res.status(500).json({
      success: false,
      error: 'Error al compartir'
    });
  }
});

/**
 * @route   GET /api/news/user/saved
 * @desc    Obtener noticias guardadas del usuario
 * @access  Private
 */
router.get('/user/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedNews');

    res.json({
      success: true,
      data: user.savedNews
    });
  } catch (error) {
    console.error('Error al obtener noticias guardadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener noticias guardadas'
    });
  }
});

/**
 * @route   GET /api/news/categories/list
 * @desc    Obtener lista de categor?as con conteo
 * @access  Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categor?as:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categor?as'
    });
  }
});

module.exports = router;
