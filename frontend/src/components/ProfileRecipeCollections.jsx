import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Heart, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RecipeDetail } from './recipes/RecipeDetail';
import {
  deleteRecipe,
  getFavoriteRecipes,
  getMyRecipes,
  toggleFavorite,
  updateRecipe
} from '../services/recipeService';
import { useNotification } from '../context/NotificationContext';
import { getRecipeImage } from '../utils/recipeImage';

const categories = ['desayuno', 'almuerzo/cena', 'merienda', 'snack', 'post-entreno', 'cena ligera'];
const difficulties = ['fácil', 'media', 'difícil'];

const categoryLabels = {
  desayuno: 'Desayuno',
  'almuerzo/cena': 'Almuerzo/Cena',
  merienda: 'Merienda',
  snack: 'Snack',
  'post-entreno': 'Post-entreno',
  'cena ligera': 'Cena ligera'
};

const difficultyLabels = {
  fácil: 'Fácil',
  media: 'Media',
  difícil: 'Difícil'
};

const toEditDraft = (recipe = {}) => ({
  title: recipe.title || '',
  description: recipe.description || '',
  category: recipe.category || categories[0],
  difficulty: recipe.difficulty || difficulties[0],
  prepTime: String(recipe.prepTime || 1),
  ingredientsText: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
  stepsText: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
  tagsText: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : ''
});

const parseMultiline = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const mapRecipeToDetailModel = (recipe = {}) => ({
  id: recipe._id,
  title: recipe.title || 'Receta',
  image: getRecipeImage(recipe),
  calories: recipe.nutrition?.calories || 0,
  protein: recipe.nutrition?.protein || 0,
  carbs: recipe.nutrition?.carbs || 0,
  fats: recipe.nutrition?.fats || 0,
  prepTime: recipe.prepTime || 0,
  difficulty: difficultyLabels[recipe.difficulty] || recipe.difficulty || 'N/D',
  category: categoryLabels[recipe.category] || recipe.category || 'Sin categoría',
  tags: Array.isArray(recipe.tags) ? recipe.tags : [],
  averageRating: recipe.averageRating || 0,
  reviewsCount: recipe.reviewsCount || 0,
  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
  steps: Array.isArray(recipe.steps) ? recipe.steps : []
});

const PixelX = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" className={className}>
    <path d="M0 0h1v1H0V0zm1 1h1v1H1V1zm1 1h1v1H2V2zm1 1h1v1H3V3zm1 1h1v1H4V4zm1 1h1v1H5V5zm1 1h1v1H6V6zm1 1h1v1H7V7zM0 7h1v1H0V7zm1-1h1v1H1V6zm1-1h1v1H2V5zm1-1h1v1H3V4zm2-2h1v1H5V2zm1-1h1v1H6V1zm1-1h1v1H7V0z" />
  </svg>
);

export function ProfileRecipeCollections({ token, onDataChanged }) {
  const { showNotification } = useNotification();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingEdition, setSavingEdition] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [favoriteToRemove, setFavoriteToRemove] = useState(null);
  const [removingFavorite, setRemovingFavorite] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [draft, setDraft] = useState(() => toEditDraft());

  const hasCollections = useMemo(
    () => favoriteRecipes.length > 0 || myRecipes.length > 0,
    [favoriteRecipes.length, myRecipes.length]
  );

  const loadCollections = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError('');

    try {
      const [favoritesResponse, myRecipesResponse] = await Promise.all([
        getFavoriteRecipes(token),
        getMyRecipes(token)
      ]);

      setFavoriteRecipes(Array.isArray(favoritesResponse?.data) ? favoritesResponse.data : []);
      setMyRecipes(Array.isArray(myRecipesResponse?.data) ? myRecipesResponse.data : []);
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar tus recetas');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const notifyParent = useCallback(() => {
    if (typeof onDataChanged === 'function') {
      onDataChanged();
    }
  }, [onDataChanged]);

  const openRecipeDetail = (recipe) => {
    setSelectedRecipe(mapRecipeToDetailModel(recipe));
  };

  const requestRemoveFavorite = (recipe) => {
    setFavoriteToRemove(recipe);
  };

  const closeFavoriteModal = () => {
    if (removingFavorite) return;
    setFavoriteToRemove(null);
  };

  const handleRemoveFavorite = async () => {
    if (!token || !favoriteToRemove?._id) return;

    try {
      setRemovingFavorite(true);
      await toggleFavorite(favoriteToRemove._id, token);
      showNotification('Favorito eliminado', 'success');
      setFavoriteToRemove(null);
      await loadCollections({ silent: true });
      notifyParent();
    } catch (actionError) {
      showNotification(actionError.message || 'No se pudo quitar el favorito', 'error');
    } finally {
      setRemovingFavorite(false);
    }
  };

  const requestDeleteRecipe = (recipe) => {
    setRecipeToDelete(recipe);
  };

  const closeDeleteModal = () => {
    if (deletingRecipe) return;
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = async () => {
    if (!token || !recipeToDelete?._id) return;

    try {
      setDeletingRecipe(true);
      await deleteRecipe(recipeToDelete._id, token);
      showNotification('Receta eliminada', 'success');
      if (selectedRecipe?.id === recipeToDelete._id) {
        setSelectedRecipe(null);
      }
      setRecipeToDelete(null);
      await loadCollections({ silent: true });
      notifyParent();
    } catch (actionError) {
      showNotification(actionError.message || 'No se pudo eliminar la receta', 'error');
    } finally {
      setDeletingRecipe(false);
    }
  };

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setDraft(toEditDraft(recipe));
  };

  const closeEditModal = () => {
    if (savingEdition) return;
    setEditingRecipe(null);
    setDraft(toEditDraft());
  };

  const handleDraftChange = (field) => (event) => {
    const value = event?.target?.value ?? '';
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdition = async (event) => {
    event.preventDefault();
    if (!editingRecipe || !token) return;

    const ingredients = parseMultiline(draft.ingredientsText);
    const steps = parseMultiline(draft.stepsText);
    const title = draft.title.trim();
    const description = draft.description.trim();
    const prepTime = Number(draft.prepTime);

    if (!title || !description) {
      showNotification('Título y descripción son obligatorios', 'info');
      return;
    }
    if (!Number.isFinite(prepTime) || prepTime < 1) {
      showNotification('El tiempo debe ser mayor que 0', 'info');
      return;
    }
    if (ingredients.length === 0 || steps.length === 0) {
      showNotification('Debes incluir ingredientes y pasos', 'info');
      return;
    }

    const payload = {
      title,
      description,
      category: draft.category,
      difficulty: draft.difficulty,
      prepTime,
      ingredients,
      steps,
      tags: String(draft.tagsText || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: Array.isArray(editingRecipe.images) ? editingRecipe.images : []
    };

    try {
      setSavingEdition(true);
      await updateRecipe(editingRecipe._id, payload, token);
      showNotification('Receta actualizada correctamente', 'success');
      setEditingRecipe(null);
      setDraft(toEditDraft());
      await loadCollections({ silent: true });
      notifyParent();
    } catch (actionError) {
      showNotification(actionError.message || 'No se pudo actualizar la receta', 'error');
    } finally {
      setSavingEdition(false);
    }
  };

  return (
    <>
      <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-3xl font-logo text-gray-900">
              RECETAS <span className="text-pink-accent">GUARDADAS Y PUBLICADAS</span>
            </h3>
            <p className="text-sm text-gray-600">Consulta, edita o elimina tus recetas. Todo se actualiza en la base de datos.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => loadCollections()} className="border-2 border-gray-900">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {loading && <p className="text-gray-500">Cargando colecciones...</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}
        {!loading && !error && !hasCollections && <p className="text-gray-500">Aún no tienes recetas en favoritos ni recetas propias.</p>}

        {!loading && !error && hasCollections && (
          <div className="grid xl:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Favoritos</h4>
              {favoriteRecipes.length === 0 && <p className="text-sm text-gray-500">No tienes favoritos guardados.</p>}
              {favoriteRecipes.map((recipe) => (
                <RecipeCard
                  key={`fav-${recipe._id}`}
                  recipe={recipe}
                  onOpen={() => openRecipeDetail(recipe)}
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        requestRemoveFavorite(recipe);
                      }}
                      className="border-2 border-gray-900 px-2 h-8"
                    >
                      <Heart className="w-4 h-4 mr-1 fill-pink-accent text-pink-accent" />
                      Quitar
                    </Button>
                  }
                />
              ))}
            </section>

            <section className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Mis recetas</h4>
              {myRecipes.length === 0 && <p className="text-sm text-gray-500">Aún no publicaste recetas.</p>}
              {myRecipes.map((recipe) => (
                <RecipeCard
                  key={`mine-${recipe._id}`}
                  recipe={recipe}
                  onOpen={() => openRecipeDetail(recipe)}
                  actions={
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditModal(recipe);
                        }}
                        className="border-2 border-gray-900 px-2 h-8"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          requestDeleteRecipe(recipe);
                        }}
                        className="border-2 border-gray-900 px-2 h-8 hover:bg-red-600 hover:text-white hover:border-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  }
                />
              ))}
            </section>
          </div>
        )}
      </Card>

      {editingRecipe && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={closeEditModal}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-2 border-pink-accent rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Editar receta</h3>
              <button type="button" onClick={closeEditModal} className="p-1 text-gray-500 hover:text-gray-900">
                <PixelX size={16} className="text-pink-accent" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveEdition}>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <input
                  id="edit-title"
                  value={draft.title}
                  onChange={handleDraftChange('title')}
                  className="h-10 w-full border-2 border-gray-900 px-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <textarea
                  id="edit-description"
                  value={draft.description}
                  onChange={handleDraftChange('description')}
                  className="min-h-24 w-full border-2 border-gray-900 p-3"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <select id="edit-category" value={draft.category} onChange={handleDraftChange('category')} className="h-10 w-full border-2 border-gray-900 px-3 bg-white">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category] || category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty">Dificultad</Label>
                  <select id="edit-difficulty" value={draft.difficulty} onChange={handleDraftChange('difficulty')} className="h-10 w-full border-2 border-gray-900 px-3 bg-white">
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficultyLabels[difficulty] || difficulty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Tiempo (min)</Label>
                  <input
                    id="edit-time"
                    type="number"
                    min="1"
                    value={draft.prepTime}
                    onChange={handleDraftChange('prepTime')}
                    className="h-10 w-full border-2 border-gray-900 px-3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ingredients">Ingredientes (uno por línea)</Label>
                <textarea
                  id="edit-ingredients"
                  value={draft.ingredientsText}
                  onChange={handleDraftChange('ingredientsText')}
                  className="min-h-24 w-full border-2 border-gray-900 p-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-steps">Pasos (uno por línea)</Label>
                <textarea
                  id="edit-steps"
                  value={draft.stepsText}
                  onChange={handleDraftChange('stepsText')}
                  className="min-h-28 w-full border-2 border-gray-900 p-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (separados por coma)</Label>
                <input
                  id="edit-tags"
                  value={draft.tagsText}
                  onChange={handleDraftChange('tagsText')}
                  className="h-10 w-full border-2 border-gray-900 px-3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeEditModal} disabled={savingEdition}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-pink-accent hover:bg-pink-accent/90 text-white" disabled={savingEdition}>
                  {savingEdition ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {favoriteToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 modal-overlay-enter" onClick={closeFavoriteModal} />

          <div className="relative w-full max-w-sm bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] modal-content-enter">
            <div className="absolute top-0 left-0 w-full h-1 bg-pink-accent overflow-hidden">
              <div className="w-1/2 h-full bg-white/40 animate-pulse" />
            </div>

            <button onClick={closeFavoriteModal} className="absolute top-3 right-3 hover:scale-110 transition-transform p-2 group">
              <PixelX size={16} className="text-pink-accent group-hover:text-pink-accent/80" />
            </button>

            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-accent/10 mb-6 relative group">
                <div
                  className="absolute inset-0 bg-pink-accent/40 transition-transform duration-500 group-hover:rotate-90"
                  style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                />
                <Heart className="w-7 h-7 text-pink-accent fill-pink-accent relative z-10 transition-transform group-hover:scale-110" />
              </div>

              <h3 className="font-logo text-3xl text-pink-accent mb-3 tracking-tight">Quitar favorito</h3>
              <p className="font-slogan text-lg text-gray-600 mb-8 leading-relaxed">
                Esta receta saldrá de tus favoritos: <strong>{favoriteToRemove.title}</strong>.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  className="bg-pink-accent hover:bg-pink-accent/90 text-white font-logo text-lg py-6 h-auto"
                  onClick={handleRemoveFavorite}
                  disabled={removingFavorite}
                >
                  {removingFavorite ? 'Quitando...' : 'Quitar'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-pink-accent hover:bg-pink-accent/5 font-logo text-lg py-6 h-auto"
                  onClick={closeFavoriteModal}
                  disabled={removingFavorite}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-12 h-1 bg-pink-accent" />
            <div className="absolute bottom-0 right-0 w-1 h-8 bg-pink-accent" />
          </div>
        </div>
      )}

      {recipeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 modal-overlay-enter" onClick={closeDeleteModal} />

          <div className="relative w-full max-w-sm bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] modal-content-enter">
            <div className="absolute top-0 left-0 w-full h-1 bg-pink-accent overflow-hidden">
              <div className="w-1/2 h-full bg-white/40 animate-pulse" />
            </div>

            <button onClick={closeDeleteModal} className="absolute top-3 right-3 hover:scale-110 transition-transform p-2 group">
              <PixelX size={16} className="text-pink-accent group-hover:text-pink-accent/80" />
            </button>

            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-accent/10 mb-6 relative group">
                <div
                  className="absolute inset-0 bg-pink-accent/40 transition-transform duration-500 group-hover:rotate-90"
                  style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                />
                <Trash2 className="w-7 h-7 text-pink-accent relative z-10 transition-transform group-hover:scale-110" />
              </div>

              <h3 className="font-logo text-3xl text-pink-accent mb-3 tracking-tight">¿Eliminar receta?</h3>
              <p className="font-slogan text-lg text-gray-600 mb-8 leading-relaxed">
                Se borrará definitivamente <strong>{recipeToDelete.title}</strong> y no se podrá recuperar.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  className="bg-pink-accent hover:bg-pink-accent/90 text-white font-logo text-lg py-6 h-auto"
                  onClick={handleDeleteRecipe}
                  disabled={deletingRecipe}
                >
                  {deletingRecipe ? 'Eliminando...' : 'Eliminar'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-pink-accent hover:bg-pink-accent/5 font-logo text-lg py-6 h-auto"
                  onClick={closeDeleteModal}
                  disabled={deletingRecipe}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-12 h-1 bg-pink-accent" />
            <div className="absolute bottom-0 right-0 w-1 h-8 bg-pink-accent" />
          </div>
        </div>
      )}

      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </>
  );
}

function RecipeCard({ recipe, onOpen, actions }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-pink-accent/40 hover:shadow-[4px_4px_0px_0px_#ff0a60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-accent"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-28 h-28 border border-gray-200 bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            src={getRecipeImage(recipe)}
            alt={`Imagen de ${recipe.title || 'receta'}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h5 className="text-2xl font-bold text-gray-900 uppercase leading-tight">{recipe.title}</h5>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                {(categoryLabels[recipe.category] || recipe.category || 'Sin categoría')} · {(difficultyLabels[recipe.difficulty] || recipe.difficulty || 'N/D')} · {recipe.prepTime || 0} min
              </p>
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-pink-accent">
            <Eye className="w-3.5 h-3.5" />
            Ver receta completa
          </div>
        </div>
      </div>
    </article>
  );
}
