import { apiRequest } from './apiClient';

const normalizeErrorText = (value = '') =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function getFavoriteErrorMessage(error, { action = 'toggle' } = {}) {
  const message = String(error?.message || '').trim();
  const normalized = normalizeErrorText(message);

  if (!message) {
    return action === 'remove'
      ? 'No se pudo quitar la receta de favoritos. Inténtalo de nuevo.'
      : 'No se pudo actualizar el favorito. Inténtalo de nuevo.';
  }

  if (normalized.includes('no se pudo conectar con el servidor')) {
    return 'No se pudo actualizar favoritos porque no hay conexión con el servidor.';
  }

  if (normalized.includes('debes iniciar sesion')) {
    return 'Tu sesión es necesaria para gestionar favoritos. Inicia sesión y vuelve a intentarlo.';
  }

  if (normalized.includes('no puedes dar me gusta') || normalized.includes('tu propia receta')) {
    return 'No puedes guardar en favoritos una receta creada por tu propia cuenta.';
  }

  if (normalized.includes('receta no encontrada')) {
    return action === 'remove'
      ? 'La receta ya no está disponible, así que no se puede quitar de favoritos.'
      : 'La receta ya no está disponible, así que no se puede guardar en favoritos.';
  }

  if (normalized.includes('no se pudo actualizar el favorito')) {
    return action === 'remove'
      ? 'No se pudo quitar la receta de favoritos. Prueba de nuevo en unos segundos.'
      : 'No se pudo guardar la receta en favoritos. Prueba de nuevo en unos segundos.';
  }

  return message;
}

export function getRecipeMutationErrorMessage(error, { action = 'create' } = {}) {
  const message = String(error?.message || '').trim();
  const normalized = normalizeErrorText(message);

  const fallbackByAction = {
    create: 'No se pudo publicar la receta. Inténtalo de nuevo.',
    update: 'No se pudo actualizar la receta. Inténtalo de nuevo.',
    delete: 'No se pudo eliminar la receta. Inténtalo de nuevo.'
  };

  if (!message) {
    return fallbackByAction[action] || fallbackByAction.create;
  }

  if (normalized.includes('no se pudo conectar con el servidor')) {
    return `No se pudo ${action === 'delete' ? 'eliminar' : action === 'update' ? 'actualizar' : 'publicar'} la receta porque no hay conexión con el servidor.`;
  }

  if (normalized.includes('debes iniciar sesion') || normalized.includes('unauthorized')) {
    return 'Tu sesión ya no es válida. Inicia sesión de nuevo para continuar.';
  }

  if (normalized.includes('no tienes permisos')) {
    return action === 'update'
      ? 'No tienes permisos para editar esta receta.'
      : 'No tienes permisos para eliminar esta receta.';
  }

  if (normalized.includes('receta no encontrada')) {
    return action === 'delete'
      ? 'La receta ya no existe o ya fue eliminada.'
      : 'La receta ya no está disponible.';
  }

  if (normalized.includes('error de validacion') || normalized.includes('validacion')) {
    return message;
  }

  if (normalized.includes('titulo es obligatorio')) return 'Debes indicar un título para la receta.';
  if (normalized.includes('descripcion es obligatoria')) return 'Debes indicar una descripción para la receta.';
  if (normalized.includes('al menos un ingrediente')) return 'Debes añadir al menos un ingrediente.';
  if (normalized.includes('al menos un paso')) return 'Debes añadir al menos un paso de preparación.';
  if (normalized.includes('maximo 20 ingredientes')) return 'La receta no puede tener más de 20 ingredientes.';
  if (normalized.includes('maximo 20 pasos')) return 'La receta no puede tener más de 20 pasos.';
  if (normalized.includes('maximo de 80 palabras')) return 'Cada paso puede tener como máximo 80 palabras.';
  if (normalized.includes('maximo de 5 imagenes') || normalized.includes('maximo 5 imagenes')) return 'Solo puedes subir hasta 5 imágenes por receta.';
  if (normalized.includes('maximo de 3 tags') || normalized.includes('maximo 3 tags')) return 'Solo puedes asignar hasta 3 tags por receta.';
  if (normalized.includes('tiempo de preparacion')) return 'El tiempo de preparación debe estar entre 1 y 999 minutos.';
  if (normalized.includes('categoria no valida') || normalized.includes('la categoria debe ser una de')) return 'La categoría seleccionada no es válida.';
  if (normalized.includes('dificultad no valida') || normalized.includes('la dificultad debe ser una de')) return 'La dificultad seleccionada no es válida.';

  return message;
}

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
