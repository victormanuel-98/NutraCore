const mongoose = require('mongoose');

const validateObjectIdParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ success: false, error: `El parametro ${paramName} no es valido` });
  }
  return next();
};

const requireBodyFields = (fields = []) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Faltan campos requeridos: ${missing.join(', ')}`
    });
  }

  return next();
};

module.exports = {
  validateObjectIdParam,
  requireBodyFields
};
