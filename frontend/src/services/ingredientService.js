import { apiRequest } from './apiClient';

export async function searchIngredients(query, limit = 8) {
  const safeQuery = String(query || '').trim();

  if (safeQuery.length < 2) {
    return { success: true, data: [] };
  }

  const params = new URLSearchParams({
    q: safeQuery,
    limit: String(limit)
  });

  return apiRequest(`/ingredients/search?${params.toString()}`);
}

export async function getIngredientNutritionProfile({ id, name, nameEn, sampleSize = 25 }) {
  const params = new URLSearchParams();

  if (id) params.set('id', String(id));
  if (name) params.set('name', String(name));
  if (nameEn) params.set('nameEn', String(nameEn));
  params.set('sampleSize', String(sampleSize));

  return apiRequest(`/ingredients/profile?${params.toString()}`);
}
