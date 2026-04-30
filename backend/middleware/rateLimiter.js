const WINDOW_MS_DEFAULT = 15 * 60 * 1000;
const MAX_DEFAULT = 100;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const store = new Map();
let cleanupStarted = false;

const now = () => Date.now();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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

const startCleanupLoop = () => {
  if (cleanupStarted) return;
  cleanupStarted = true;

  setInterval(() => {
    const timestamp = now();

    for (const [key, entry] of store.entries()) {
      entry.hits = cleanupExpired(entry.hits, timestamp, entry.windowMs);

      if (entry.hits.length === 0) {
        store.delete(key);
      } else {
        store.set(key, entry);
      }
    }
  }, CLEANUP_INTERVAL_MS).unref();
};

const readEnvLimit = (envWindowMsKey, envMaxKey, fallbackWindowMs, fallbackMax) => {
  const windowMs = Math.max(1000, toNumber(process.env[envWindowMsKey], fallbackWindowMs));
  const max = Math.max(1, toNumber(process.env[envMaxKey], fallbackMax));
  return { windowMs, max };
};

const rateLimit = ({ windowMs = WINDOW_MS_DEFAULT, max = MAX_DEFAULT, keyPrefix = 'global' } = {}) => {
  startCleanupLoop();

  return (req, res, next) => {
    const key = buildKey(req, keyPrefix);
    const timestamp = now();

    const entry = store.get(key) || { hits: [], windowMs };
    entry.windowMs = windowMs;
    entry.hits = cleanupExpired(entry.hits, timestamp, windowMs);

    const remaining = Math.max(0, max - entry.hits.length);
    const resetAt = entry.hits[0] ? entry.hits[0] + windowMs : timestamp + windowMs;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000));

    if (entry.hits.length >= max) {
      const retryAfterMs = windowMs - (timestamp - entry.hits[0]);
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
      });
    }

    entry.hits.push(timestamp);
    store.set(key, entry);

    return next();
  };
};

module.exports = {
  rateLimit,
  readEnvLimit
};
