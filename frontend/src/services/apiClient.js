const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
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
    const message = payload?.error || payload?.message || 'Error en la petición';
    throw new Error(details ? `${message}: ${details}` : message);
  }

  return payload;
}
