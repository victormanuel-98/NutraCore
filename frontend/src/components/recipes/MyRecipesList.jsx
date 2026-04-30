import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { deleteRecipe, getMyRecipes, updateRecipe } from '../../services/recipeService';
import { getRecipeImage } from '../../utils/recipeImage';

const categories = ['desayuno', 'almuerzo/cena', 'merienda', 'snack', 'post-entreno', 'cena ligera'];
const difficulties = ['facil', 'media', 'dificil'];

const categoryLabels = {
  desayuno: 'Desayuno',
  'almuerzo/cena': 'Almuerzo/Cena',
  merienda: 'Merienda',
  snack: 'Snack',
  'post-entreno': 'Post-entreno',
  'cena ligera': 'Cena ligera'
};

const difficultyLabels = {
  facil: 'Facil',
  media: 'Media',
  dificil: 'Dificil'
};

const normalizeDifficulty = (value = '') => {
  const normalized = String(value || '').toLowerCase().trim();
  if (['facil', 'fácil'].includes(normalized)) return 'facil';
  if (['dificil', 'difícil'].includes(normalized)) return 'dificil';
  if (normalized === 'media') return 'media';
  return 'media';
};

const formatCategory = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return categoryLabels[normalized] || 'Sin categoría';
};

const toEditDraft = (recipe = {}) => ({
  title: recipe.title || '',
  description: recipe.description || '',
  category: recipe.category || categories[0],
  difficulty: normalizeDifficulty(recipe.difficulty),
  prepTime: String(recipe.prepTime || 1),
  ingredientsText: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
  stepsText: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
  tagsText: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
  imagesText: Array.isArray(recipe.images) ? recipe.images.filter(Boolean).join('\n') : ''
});

const parseMultiline = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

export function MyRecipesList({ token, refreshKey = 0 }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [draft, setDraft] = useState(() => toEditDraft());
  const [savingEdition, setSavingEdition] = useState(false);

  const loadRecipes = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await getMyRecipes(token);
      setRecipes(response.data || []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus recetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [token, refreshKey]);

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

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Seguro que quieres eliminar esta receta?');
    if (!shouldDelete) return;

    try {
      await deleteRecipe(id, token);
      setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    } catch (err) {
      alert(err.message || 'No se pudo eliminar la receta');
    }
  };

  const handleSaveEdition = async (event) => {
    event.preventDefault();
    if (!editingRecipe) return;

    const title = draft.title.trim();
    const description = draft.description.trim();
    const prepTime = Number(draft.prepTime);
    const ingredients = parseMultiline(draft.ingredientsText);
    const steps = parseMultiline(draft.stepsText);
    const images = parseMultiline(draft.imagesText);
    const tags = String(draft.tagsText || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!title || !description) {
      alert('Título y descripción son obligatorios');
      return;
    }
    if (!Number.isFinite(prepTime) || prepTime < 1) {
      alert('El tiempo debe ser mayor que 0');
      return;
    }
    if (ingredients.length === 0 || steps.length === 0) {
      alert('Debes incluir ingredientes y pasos');
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
      tags,
      images
    };

    try {
      setSavingEdition(true);
      await updateRecipe(editingRecipe._id, payload, token);
      setRecipes((prev) => prev.map((item) => (item._id === editingRecipe._id ? { ...item, ...payload } : item)));
      closeEditModal();
    } catch (err) {
      alert(err.message || 'No se pudo actualizar la receta');
    } finally {
      setSavingEdition(false);
    }
  };

  const sortedRecipes = useMemo(() => [...recipes], [recipes]);

  return (
    <>
      <Card className="p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 uppercase" style={{ fontFamily: "'Gajraj One', cursive" }}>
            Mis <span className="text-pink-accent">Publicaciones</span>
          </h2>
          <Button
            variant="outline"
            onClick={loadRecipes}
            className="border-2 border-gray-900 rounded-none hover:bg-gray-900 hover:text-white transition-colors"
          >
            ACTUALIZAR
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-accent"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : sortedRecipes.length === 0 ? (
          <p className="text-gray-500 italic">Todavía no tienes recetas publicadas en el laboratorio.</p>
        ) : (
          <div className="space-y-6">
            {sortedRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="border-2 border-gray-200 p-4 transition-all hover:border-pink-accent/40 group relative"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-24 h-24 flex-shrink-0 border border-gray-100 bg-gray-100 overflow-hidden">
                    <img
                      src={getRecipeImage(recipe).includes('cloudinary.com') ? getRecipeImage(recipe).replace('/upload/', '/upload/w_150,h_150,c_fill,f_auto,q_auto/') : getRecipeImage(recipe)}
                      alt={recipe.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{recipe.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-500 uppercase">
                          <span>{formatCategory(recipe.category)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{difficultyLabels[normalizeDifficulty(recipe.difficulty)] || 'Media'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{recipe.prepTime || 0} MIN</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(recipe)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-gray-900 text-xs font-bold hover:bg-gray-900 hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          EDITAR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(recipe._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-gray-900 text-xs font-bold hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          BORRAR
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">{recipe.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingRecipe && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={closeEditModal}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-2 border-pink-accent rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Editar receta en Lab</h3>
              <button type="button" onClick={closeEditModal} className="p-1 text-gray-500 hover:text-gray-900">
                <X className="w-4 h-4 text-pink-accent" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveEdition}>
              <div className="space-y-2">
                <label htmlFor="lab-edit-title" className="text-sm font-medium text-gray-700">Título</label>
                <input
                  id="lab-edit-title"
                  value={draft.title}
                  onChange={handleDraftChange('title')}
                  className="h-10 w-full border-2 border-gray-900 px-3 rounded-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lab-edit-description" className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  id="lab-edit-description"
                  value={draft.description}
                  onChange={handleDraftChange('description')}
                  className="min-h-24 w-full border-2 border-gray-900 p-3 rounded-none"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="lab-edit-category" className="text-sm font-medium text-gray-700">Categoria</label>
                  <select id="lab-edit-category" value={draft.category} onChange={handleDraftChange('category')} className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category] || category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lab-edit-difficulty" className="text-sm font-medium text-gray-700">Dificultad</label>
                  <select id="lab-edit-difficulty" value={draft.difficulty} onChange={handleDraftChange('difficulty')} className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none">
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficultyLabels[difficulty] || difficulty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lab-edit-time" className="text-sm font-medium text-gray-700">Tiempo (min)</label>
                  <input
                    id="lab-edit-time"
                    type="number"
                    min="1"
                    value={draft.prepTime}
                    onChange={handleDraftChange('prepTime')}
                    className="h-10 w-full border-2 border-gray-900 px-3 rounded-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lab-edit-ingredients" className="text-sm font-medium text-gray-700">Ingredientes (uno por línea)</label>
                <textarea
                  id="lab-edit-ingredients"
                  value={draft.ingredientsText}
                  onChange={handleDraftChange('ingredientsText')}
                  className="min-h-24 w-full border-2 border-gray-900 p-3 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lab-edit-steps" className="text-sm font-medium text-gray-700">Pasos (uno por línea)</label>
                <textarea
                  id="lab-edit-steps"
                  value={draft.stepsText}
                  onChange={handleDraftChange('stepsText')}
                  className="min-h-28 w-full border-2 border-gray-900 p-3 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lab-edit-tags" className="text-sm font-medium text-gray-700">Tags (separados por coma)</label>
                <input
                  id="lab-edit-tags"
                  value={draft.tagsText}
                  onChange={handleDraftChange('tagsText')}
                  className="h-10 w-full border-2 border-gray-900 px-3 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lab-edit-images" className="text-sm font-medium text-gray-700">Imágenes (URL, una por línea)</label>
                <textarea
                  id="lab-edit-images"
                  value={draft.imagesText}
                  onChange={handleDraftChange('imagesText')}
                  className="min-h-24 w-full border-2 border-gray-900 p-3 rounded-none"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500">Si lo dejas vacío, se mostrara la hamburguesa pixel por defecto.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeEditModal} disabled={savingEdition} className="rounded-none border-2 border-gray-900">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none" disabled={savingEdition}>
                  {savingEdition ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
