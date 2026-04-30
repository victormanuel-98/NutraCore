const AuditLog = require('../models/AuditLog');

const normalizeIp = (value = '') => String(value || '').replace(/^::ffff:/, '');

const getClientIp = (req) => normalizeIp(req?.ip || req?.connection?.remoteAddress || '');

const logAuditEvent = async ({ req, actor, action, targetType, targetId = null, metadata = {} }) => {
  try {
    if (!actor?._id) return;

    await AuditLog.create({
      actor: actor._id,
      actorRole: actor.role || 'user',
      action,
      targetType,
      targetId,
      metadata,
      ip: req ? getClientIp(req) : ''
    });
  } catch (error) {
    // Non-blocking audit trail.
    // eslint-disable-next-line no-console
    console.error('No se pudo registrar auditoria:', error.message);
  }
};

module.exports = {
  logAuditEvent
};
