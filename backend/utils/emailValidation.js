const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LOCAL_LENGTH = 30;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const getEmailLocalPart = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const atIndex = normalizedEmail.indexOf('@');

  if (atIndex === -1) {
    return normalizedEmail;
  }

  return normalizedEmail.slice(0, atIndex);
};

const isEmailLocalPartTooLong = (email) => getEmailLocalPart(email).length > MAX_EMAIL_LOCAL_LENGTH;

const validateEmailAddress = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return {
      isValid: false,
      normalizedEmail,
      error: 'El email es obligatorio'
    };
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      isValid: false,
      normalizedEmail,
      error: 'Email invalido'
    };
  }

  if (isEmailLocalPartTooLong(normalizedEmail)) {
    return {
      isValid: false,
      normalizedEmail,
      error: `La parte anterior a @ debe tener como maximo ${MAX_EMAIL_LOCAL_LENGTH} caracteres`
    };
  }

  return {
    isValid: true,
    normalizedEmail,
    error: null
  };
};

module.exports = {
  EMAIL_REGEX,
  MAX_EMAIL_LOCAL_LENGTH,
  getEmailLocalPart,
  isEmailLocalPartTooLong,
  normalizeEmail,
  validateEmailAddress
};
