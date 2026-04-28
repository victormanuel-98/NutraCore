import { apiRequest } from './apiClient';

export async function createRecipe(data, token) {
  return apiRequest('/recipes', {
    method: 'POST',
    token,
    body: data
  });
}

export async function getRecipes(filters = {}, token) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, String(value));
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';

  return apiRequest(`/recipes${query}`, {
    token
  });
}

export async function getRecipeById(id, token) {
  return apiRequest(`/recipes/${id}`, {
    token
  });
}

export async function updateRecipe(id, data, token) {
  return apiRequest(`/recipes/${id}`, {
    method: 'PUT',
    token,
    body: data
  });
}

export async function deleteRecipe(id, token) {
  return apiRequest(`/recipes/${id}`, {
    method: 'DELETE',
    token
  });
}

export async function toggleFavorite(id, token) {
  return apiRequest(`/recipes/${id}/favorite`, {
    method: 'POST',
    token
  });
}

export async function getMyRecipes(token) {
  return apiRequest('/recipes/user/me', {
    token
  });
}

export async function getFavoriteRecipes(token) {
  return apiRequest('/recipes/user/favorites', {
    token
  });
}

export async function getPopularRecipes(limit = 6) {
  return apiRequest(`/recipes/featured/popular?limit=${limit}`);
}

export async function getAvailableRecipeTags() {
  return apiRequest('/recipes/tags/available');
}
