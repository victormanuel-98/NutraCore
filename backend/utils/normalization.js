const removeDiacritics = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeLooseKey = (value = '') =>
  removeDiacritics(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const normalizeEnumValue = (value, allowedValues = []) => {
  const normalizedInput = normalizeLooseKey(value);
  if (!normalizedInput) return '';

  const match = allowedValues.find((entry) => normalizeLooseKey(entry) === normalizedInput);
  return match || normalizedInput;
};

module.exports = {
  removeDiacritics,
  normalizeLooseKey,
  normalizeEnumValue
};
