import { apiRequest } from './apiClient';

export async function getNews(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, String(value));
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';

  return apiRequest(`/news${query}`);
}
