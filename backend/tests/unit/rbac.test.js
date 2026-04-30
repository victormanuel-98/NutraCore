const {
  isAdmin,
  isOwner,
  canDeleteRecipe,
  canManageOwnAccount,
  canAdminManageUser
} = require('../../middleware/rbac');

describe('rbac helpers', () => {
  test('isAdmin should detect admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
    expect(isAdmin({ role: 'user' })).toBe(false);
  });

  test('isOwner should compare object ids as strings', () => {
    expect(isOwner('123', { _id: 123 })).toBe(true);
    expect(isOwner('123', { _id: '999' })).toBe(false);
  });

  test('canDeleteRecipe should allow owner or admin', () => {
    const recipe = { author: 'u1' };
    expect(canDeleteRecipe(recipe, { _id: 'u1', role: 'user' })).toBe(true);
    expect(canDeleteRecipe(recipe, { _id: 'u2', role: 'admin' })).toBe(true);
    expect(canDeleteRecipe(recipe, { _id: 'u2', role: 'user' })).toBe(false);
  });

  test('canManageOwnAccount and canAdminManageUser should enforce rules', () => {
    expect(canManageOwnAccount('u1', { _id: 'u1' })).toBe(true);
    expect(canManageOwnAccount('u2', { _id: 'u1' })).toBe(false);

    const admin = { _id: 'a1', role: 'admin' };
    const user = { _id: 'u1', role: 'user' };
    const otherAdmin = { _id: 'a2', role: 'admin' };

    expect(canAdminManageUser(user, admin)).toBe(true);
    expect(canAdminManageUser(admin, admin)).toBe(false);
    expect(canAdminManageUser(otherAdmin, admin)).toBe(false);
  });
});
