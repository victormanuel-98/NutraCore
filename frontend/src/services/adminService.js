import { apiRequest } from './apiClient';

export async function getAdminUsers(token) {
  return apiRequest('/users/admin/list', { token });
}

export async function getAdminUserById(userId, token) {
  return apiRequest(`/users/admin/${userId}`, { token });
}

export async function setAdminUserStatus(userId, isActive, token) {
  return apiRequest(`/users/admin/${userId}/status`, {
    method: 'PATCH',
    token,
    body: { isActive }
  });
}

export async function softDeleteUserByAdmin(userId, token) {
  return apiRequest(`/users/admin/${userId}`, {
    method: 'DELETE',
    token
  });
}

export async function restoreUserByAdmin(userId, token) {
  return apiRequest(`/users/admin/${userId}/restore`, {
    method: 'PATCH',
    token
  });
}

export async function getAuditLogs(token, limit = 50) {
  return apiRequest(`/users/admin/audit/logs?limit=${limit}`, { token });
}
