describe('middleware/auth placeholder module', () => {
  test('exports an object', () => {
    const exported = require('../../middleware/auth');
    expect(typeof exported).toBe('object');
  });
});
