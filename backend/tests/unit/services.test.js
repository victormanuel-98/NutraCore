jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    url: jest.fn((publicId) => `https://res.cloudinary.com/demo/${publicId}`)
  }
}));

jest.mock('../../models/AuditLog', () => ({
  create: jest.fn()
}));

const AuditLog = require('../../models/AuditLog');
const { getOptimizedUrl, getAvatarUrl, getRecipeThumbnailUrl } = require('../../services/cloudinaryService');
const { logAuditEvent } = require('../../services/auditService');

describe('services helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('cloudinary helper should handle null and remote urls', () => {
    expect(getOptimizedUrl(null)).toBeNull();
    expect(getOptimizedUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    expect(getAvatarUrl('avatar123')).toMatch(/cloudinary/);
    expect(getRecipeThumbnailUrl('recipe123')).toMatch(/cloudinary/);
  });

  test('audit service writes event with normalized req.ip', async () => {
    await logAuditEvent({
      req: { ip: '::ffff:1.2.3.4' },
      actor: { _id: 'u1', role: 'admin' },
      action: 'test.action',
      targetType: 'Recipe',
      targetId: 'r1'
    });
    expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ ip: '1.2.3.4' }));
  });

  test('audit service is no-op when actor is missing', async () => {
    await logAuditEvent({ req: {}, actor: null, action: 'x', targetType: 'Y' });
    expect(AuditLog.create).not.toHaveBeenCalled();
  });
});
