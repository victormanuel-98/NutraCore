export const MAX_EMAIL_LOCAL_LENGTH = 30;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function getEmailLocalPart(email) {
  const normalizedEmail = normalizeEmail(email);
  const atIndex = normalizedEmail.indexOf('@');

  if (atIndex === -1) {
    return normalizedEmail;
  }

  return normalizedEmail.slice(0, atIndex);
}

export function isEmailLocalPartTooLong(email) {
  return getEmailLocalPart(email).length > MAX_EMAIL_LOCAL_LENGTH;
}

export function validateEmailAddress(email) {
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
      error: 'Introduce un correo válido'
    };
  }

  if (isEmailLocalPartTooLong(normalizedEmail)) {
    return {
      isValid: false,
      normalizedEmail,
      error: `La parte anterior a @ debe tener como máximo ${MAX_EMAIL_LOCAL_LENGTH} caracteres`
    };
  }

  return {
    isValid: true,
    normalizedEmail,
    error: null
  };
}
