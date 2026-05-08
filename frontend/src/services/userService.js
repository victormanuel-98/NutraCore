import { apiRequest } from './apiClient';

export async function getUserProfile(token) {
  return apiRequest('/users/profile', { token });
}

export async function updateUserProfile(payload, token) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    token,
    body: payload
  });
}

export async function getUserStats(token) {
  return apiRequest('/users/stats', { token });
}

export async function updateUserGoals(payload, token) {
  return apiRequest('/users/goals', {
    method: 'PUT',
    token,
    body: payload
  });
}

export async function getMenuConsumptionState(token) {
  return apiRequest('/users/menu-consumption', { token });
}

export async function saveMenuConsumptionState(payload, token) {
  return apiRequest('/users/menu-consumption', {
    method: 'PUT',
    token,
    body: payload
  });
}
