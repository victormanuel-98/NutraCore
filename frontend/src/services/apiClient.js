const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const translateTechnicalError = (message = '') => {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('self-signed certificate') || normalized.includes('certificate chain')) {
    return 'No se pudo crear la cuenta por un problema de certificado SSL en el servidor de correo. Inténtalo más tarde.';
  }
  if (normalized.includes('failed to fetch') || normalized.includes('networkerror') || normalized.includes('network error')) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }
  if (normalized.includes('certificate has expired')) {
    return 'No se pudo completar la operación por un problema de certificado SSL expirado.';
  }

  return message;
};

export async function apiRequest(path, { method = 'GET', token, body, headers = {} } = {}) {
  const finalHeaders = {
    ...headers
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const details = payload?.details && Array.isArray(payload.details) ? payload.details.join(' | ') : '';
    const rawMessage = payload?.error || payload?.message || 'Error en la petición';
    const message = translateTechnicalError(rawMessage);
    throw new Error(details ? `${message}: ${details}` : message);
  }

  return payload;
}
