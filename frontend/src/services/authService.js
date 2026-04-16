import { apiRequest } from './apiClient';

export async function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });
}

export async function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload
  });
}

export async function getCurrentUser(token) {
  return apiRequest('/auth/me', {
    token
  });
}
