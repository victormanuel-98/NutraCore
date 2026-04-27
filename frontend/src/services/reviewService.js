import { apiRequest } from './apiClient';

export async function addOrUpdateReview(recipeId, rating, comment, token) {
  return apiRequest('/reviews', {
    method: 'POST',
    token,
    body: { recipeId, rating, comment }
  });
}

export async function getRecipeReviews(recipeId, token) {
  return apiRequest(`/reviews/recipe/${recipeId}`, {
    token
  });
}

export async function deleteReview(reviewId, token) {
  return apiRequest(`/reviews/${reviewId}`, {
    method: 'DELETE',
    token
  });
}
