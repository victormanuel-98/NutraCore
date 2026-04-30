jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(() => 'signed-token')
}));

jest.mock('../../models/User', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect, optionalProtect, generateToken, authorizeRoles } = require('../../config/auth');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('config/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('protect returns 401 when token is missing', async () => {
    const req = { headers: {} };
    const res = buildRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('protect sets req.user and calls next when token is valid', async () => {
    jwt.verify.mockReturnValue({ id: 'u1', tokenVersion: 1 });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'u1', tokenVersion: 1, isActive: true }) });

    const req = { headers: { authorization: 'Bearer abc' } };
    const res = buildRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user._id).toBe('u1');
  });

  test('optionalProtect ignores jwt errors', async () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error('bad token');
      err.name = 'JsonWebTokenError';
      throw err;
    });
    const req = { headers: { authorization: 'Bearer bad' } };
    const res = buildRes();
    const next = jest.fn();
    await optionalProtect(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('generateToken uses shorter expiration for admin', () => {
    generateToken({ _id: 'a1', role: 'admin', tokenVersion: 2 });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin', tokenVersion: 2 }),
      'test-secret',
      expect.objectContaining({ expiresIn: '12h' })
    );
  });

  test('authorizeRoles returns 403 when role is not allowed', () => {
    const middleware = authorizeRoles('admin');
    const req = { user: { role: 'user' } };
    const res = buildRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
