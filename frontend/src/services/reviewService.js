import { apiRequest } from './apiClient';

export async function addOrUpdateReview(recipeId, rating, comment, token, options = {}) {
  const body = { recipeId, rating };

  if (options.includeComment) {
    body.comment = comment;
  }

  return apiRequest('/reviews', {
    method: 'POST',
    token,
    body
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
