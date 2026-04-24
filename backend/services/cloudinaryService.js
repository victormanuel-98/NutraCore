const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Genera una URL de imagen optimizada
 * @param {string} publicId - El ID público de la imagen o la URL completa
 * @param {Object} options - Opciones de transformación
 */
const getOptimizedUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  // Si es una URL completa de Cloudinary, extraer el publicId o simplemente devolverla si no se puede procesar
  if (publicId.startsWith('http')) {
    // Cloudinary permite pasar la URL completa a sus métodos en algunos casos, 
    // pero aquí aplicamos transformaciones simples vía string si es necesario
    if (publicId.includes('cloudinary.com')) {
      return publicId.replace('/upload/', `/upload/f_auto,q_auto,${options.width ? `w_${options.width},` : ''}${options.height ? `h_${options.height},` : ''}${options.crop ? `c_${options.crop},` : ''}`);
    }
    return publicId;
  }

  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};

/**
 * Genera una miniatura para perfiles
 */
const getAvatarUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 150,
    height: 150,
    crop: 'thumb',
    gravity: 'face'
  });
};

/**
 * Genera una miniatura para recetas
 */
const getRecipeThumbnailUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 400,
    height: 300,
    crop: 'fill'
  });
};

module.exports = {
  cloudinary,
  getOptimizedUrl,
  getAvatarUrl,
  getRecipeThumbnailUrl
};
