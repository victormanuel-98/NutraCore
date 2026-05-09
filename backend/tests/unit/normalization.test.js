const { normalizeEnumValue, normalizeLooseKey, removeDiacritics } = require('../../utils/normalization');

describe('normalization utils', () => {
  test('removeDiacritics strips accents without changing base letters', () => {
    expect(removeDiacritics('FÁCIL difícil proteína')).toBe('FACIL dificil proteina');
  });

  test('normalizeLooseKey trims, lowercases and collapses spaces', () => {
    expect(normalizeLooseKey('   FÁCIL   ')).toBe('facil');
    expect(normalizeLooseKey('Muy   Difícil')).toBe('muy dificil');
  });

  test('normalizeEnumValue maps accented variants to allowed canonical values', () => {
    expect(normalizeEnumValue(' Fácil ', ['facil', 'media', 'dificil'])).toBe('facil');
    expect(normalizeEnumValue('DIFÍCIL', ['facil', 'media', 'dificil'])).toBe('dificil');
    expect(normalizeEnumValue('media', ['facil', 'media', 'dificil'])).toBe('media');
  });

  test('normalizeEnumValue preserves invalid normalized values for later validation', () => {
    expect(normalizeEnumValue('experto', ['facil', 'media', 'dificil'])).toBe('experto');
  });
});
