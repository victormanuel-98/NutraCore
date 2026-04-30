const WINDOW_MS_DEFAULT = 15 * 60 * 1000;
const MAX_DEFAULT = 100;

const store = new Map();

const now = () => Date.now();

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

const buildKey = (req, keyPrefix) => `${keyPrefix}:${getClientIp(req)}`;

const cleanupExpired = (hits, timestamp, windowMs) =>
  hits.filter((item) => timestamp - item < windowMs);

const rateLimit = ({ windowMs = WINDOW_MS_DEFAULT, max = MAX_DEFAULT, keyPrefix = 'global' } = {}) => {
  return (req, res, next) => {
    const key = buildKey(req, keyPrefix);
    const timestamp = now();

    const entry = store.get(key) || { hits: [], windowMs };
    entry.windowMs = windowMs;
    entry.hits = cleanupExpired(entry.hits, timestamp, windowMs);

    if (entry.hits.length >= max) {
      const retryAfterMs = windowMs - (timestamp - entry.hits[0]);
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intentalo de nuevo mas tarde.'
      });
    }

    entry.hits.push(timestamp);
    store.set(key, entry);

    return next();
  };
};

module.exports = {
  rateLimit
};
