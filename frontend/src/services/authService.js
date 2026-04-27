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

export async function verifyEmail({ token, email }) {
  const params = new URLSearchParams({
    token,
    email
  });

  return apiRequest(`/auth/verify-email?${params.toString()}`);
}

export async function resendVerificationEmail(email) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: { email }
  });
}

export async function getCurrentUser(token) {
  return apiRequest('/auth/me', {
    token
  });
}

export async function changePassword(payload, token) {
  return apiRequest('/auth/change-password', {
    method: 'PUT',
    token,
    body: payload
  });
}
