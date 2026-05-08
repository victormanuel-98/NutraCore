import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Pencil, Trash2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { deleteRecipe, getAvailableRecipeTags, getMyRecipes, updateRecipe } from '../../services/recipeService';
import { getRecipeImage } from '../../utils/recipeImage';
import { RecipeImageManager } from './RecipeImageManager';

const categories = ['desayuno', 'almuerzo/cena', 'merienda', 'snack', 'post-entreno', 'cena ligera'];
const difficulties = ['facil', 'media', 'dificil'];
const MAX_RECIPE_IMAGES = 5;
const MAX_INGREDIENTS = 20;
const MAX_STEPS = 20;
const MAX_PREP_TIME = 999;
const MAX_STEP_WORDS = 80;
const MAX_DESCRIPTION_CHARS = 1200;
const MAX_RECIPE_TAGS = 3;
const BAD_WORDS = ['puto', 'puta', 'mierda', 'cabron', 'cabrona', 'joder', 'fuck', 'shit', 'asshole', 'idiota', 'estupido', 'estupida', 'coño', 'pendejo', 'pendeja'];
const FALLBACK_RECIPE_TAGS = [
  'alta-proteina',
  'bajo-en-calorias',
  'bajo-en-carbohidratos',
  'alto-en-fibra',
  'rapido',
  'facil',
  'sin-lactosa',
  'sin-gluten',
  'vegano',
  'vegetariano',
  'pre-entreno',
  'post-entreno',
  'meal-prep',
  'economico',
  'hidratante',
  'saciante'
];

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

const fieldLabelClass = 'text-xs font-bold uppercase tracking-[0.18em] text-gray-600';
const inputClass =
  'w-full rounded-none border-2 border-gray-900 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-150 hover:border-pink-accent hover:bg-pink-50/40 focus:border-pink-accent dark:hover:border-pink-300 dark:hover:bg-pink-500/8';
const textareaClass = `${inputClass} resize-none overflow-y-auto`;
const formatTagLabel = (tag) => String(tag || '').replace(/-/g, ' ').toUpperCase();

const normalizeDifficulty = (value = '') => {
  const normalized = String(value || '').toLowerCase().trim();
  if (['facil', 'fácil'].includes(normalized)) return 'facil';
  if (['dificil', 'difícil'].includes(normalized)) return 'dificil';
  if (normalized === 'media') return 'media';
  return 'media';
};

const formatCategory = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return categoryLabels[normalized] || 'Sin categoria';
};

const filterBadWords = (text = '') => {
  let filtered = String(text || '');
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

const trimWords = (value, maxWords) => {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return '';
  const words = normalized.split(' ');
  return words.length <= maxWords ? normalized : words.slice(0, maxWords).join(' ');
};

const clampNumberInput = (value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(min);
  return String(Math.max(min, Math.min(max, parsed)));
};

const parseMultiline = (value, { maxItems, maxWords } = {}) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => filterBadWords(item.trim()))
    .filter(Boolean)
    .map((item) => (maxWords ? trimWords(item, maxWords) : item))
    .slice(0, maxItems || Number.MAX_SAFE_INTEGER);

const toEditDraft = (recipe = {}) => ({
  title: recipe.title || '',
  description: recipe.description || '',
  category: recipe.category || categories[0],
  difficulty: normalizeDifficulty(recipe.difficulty),
  prepTime: String(Math.min(MAX_PREP_TIME, Math.max(1, Number(recipe.prepTime) || 1))),
  ingredientsText: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
  stepsText: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
  tags: Array.isArray(recipe.tags) ? recipe.tags.slice(0, MAX_RECIPE_TAGS) : [],
  images: Array.isArray(recipe.images) ? recipe.images.filter(Boolean).slice(0, MAX_RECIPE_IMAGES) : []
});

const Section = ({ title, extra, children }) => (
  <section className="space-y-3 border-2 border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      {extra}
    </div>
    {children}
  </section>
);

function TagSelector({ availableTags, selectedTags, onAddTag, onRemoveTag, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const remainingTags = availableTags.filter((tag) => !selectedTags.includes(tag));
  const canAddMore = selectedTags.length < MAX_RECIPE_TAGS;

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={loading || !canAddMore}
          className="font-slogan flex h-11 w-full items-center justify-between rounded-none border-2 border-pink-accent bg-pink-accent px-3 text-sm font-medium text-white transition-all duration-150 hover:bg-pink-accent/92 disabled:cursor-not-allowed disabled:opacity-60 dark:border-pink-accent dark:bg-slate-950 dark:text-gray-100 dark:hover:border-pink-300 dark:hover:bg-slate-950"
        >
          <span>{loading ? 'Cargando tags...' : 'Añadir tag'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && canAddMore && !loading && (
          <div className="edit-tag-menu font-slogan absolute z-50 mt-1 max-h-56 w-full overflow-auto border-2 border-pink-accent bg-white shadow-[4px_4px_0px_0px_#ff0a60] dark:border-pink-accent dark:bg-slate-950">
            {remainingTags.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">No quedan tags disponibles.</p>
            ) : (
              remainingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onAddTag(tag);
                    setIsOpen(false);
                  }}
                  className="edit-tag-option w-full bg-white px-3 py-2 text-left text-sm uppercase text-black transition-colors hover:bg-pink-50 hover:text-pink-accent dark:text-gray-100"
                >
                  {formatTagLabel(tag)}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-[2.75rem] flex-wrap gap-2 overflow-y-auto rounded-none border-2 border-gray-900 bg-white p-2">
        {selectedTags.length === 0 ? (
          <span className="text-xs uppercase text-gray-500">Sin tags seleccionados</span>
        ) : (
          selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 border border-pink-accent bg-pink-50 px-2 py-1 text-xs font-bold uppercase text-pink-accent">
              {formatTagLabel(tag)}
              <button type="button" onClick={() => onRemoveTag(tag)} aria-label={`Quitar tag ${tag}`}>
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <p className="text-xs uppercase text-gray-500">{selectedTags.length}/{MAX_RECIPE_TAGS} tags seleccionados</p>
    </div>
  );
}

export function MyRecipesList({ token, refreshKey = 0 }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [draft, setDraft] = useState(() => toEditDraft());
  const [savingEdition, setSavingEdition] = useState(false);
  const [availableTags, setAvailableTags] = useState(FALLBACK_RECIPE_TAGS);
  const [loadingTags, setLoadingTags] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      try {
        setLoadingTags(true);
        const response = await getAvailableRecipeTags();
        const tagsFromApi = Array.isArray(response?.data) ? response.data : [];
        if (!isMounted) return;
        setAvailableTags(tagsFromApi.length > 0 ? tagsFromApi : FALLBACK_RECIPE_TAGS);
      } catch {
        if (isMounted) setAvailableTags(FALLBACK_RECIPE_TAGS);
      } finally {
        if (isMounted) setLoadingTags(false);
      }
    };

    loadTags();
    return () => {
      isMounted = false;
    };
  }, []);

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

    if (field === 'title') {
      setDraft((prev) => ({ ...prev, title: filterBadWords(value).slice(0, 120) }));
      return;
    }

    if (field === 'description') {
      setDraft((prev) => ({ ...prev, description: filterBadWords(value).slice(0, MAX_DESCRIPTION_CHARS) }));
      return;
    }

    if (field === 'prepTime') {
      setDraft((prev) => ({ ...prev, prepTime: clampNumberInput(value, { min: 1, max: MAX_PREP_TIME }) }));
      return;
    }

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

  const addTag = (tag) => {
    if (!tag) return;
    setDraft((prev) => {
      const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
      if (currentTags.includes(tag) || currentTags.length >= MAX_RECIPE_TAGS) return prev;
      return { ...prev, tags: [...currentTags, tag] };
    });
  };

  const removeTag = (tag) => {
    setDraft((prev) => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.filter((entry) => entry !== tag) : []
    }));
  };

  const handleSaveEdition = async (event) => {
    event.preventDefault();
    if (!editingRecipe) return;

    const title = filterBadWords(draft.title.trim());
    const description = filterBadWords(draft.description.trim());
    const prepTime = Number(draft.prepTime);
    const ingredients = parseMultiline(draft.ingredientsText, { maxItems: MAX_INGREDIENTS });
    const steps = parseMultiline(draft.stepsText, { maxItems: MAX_STEPS, maxWords: MAX_STEP_WORDS });
    const tags = Array.isArray(draft.tags) ? draft.tags.slice(0, MAX_RECIPE_TAGS) : [];

    if (!title || !description) {
      alert('Titulo y descripcion son obligatorios');
      return;
    }
    if (!Number.isFinite(prepTime) || prepTime < 1 || prepTime > MAX_PREP_TIME) {
      alert(`El tiempo debe estar entre 1 y ${MAX_PREP_TIME} minutos`);
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
      images: Array.isArray(draft.images) ? draft.images.slice(0, MAX_RECIPE_IMAGES) : []
    };

    try {
      setSavingEdition(true);
      const response = await updateRecipe(editingRecipe._id, payload, token);
      const nextRecipe = response?.data || { ...editingRecipe, ...payload };

      setRecipes((prev) => prev.map((item) => (item._id === editingRecipe._id ? nextRecipe : item)));
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
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold uppercase text-gray-900" style={{ fontFamily: "'Gajraj One', cursive" }}>
            Mis <span className="text-pink-accent">Publicaciones</span>
          </h2>
          <Button
            variant="outline"
            onClick={loadRecipes}
            className="rounded-none border-2 border-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent hover:bg-pink-50 hover:text-pink-accent dark:hover:border-pink-300 dark:hover:bg-pink-500/10 dark:hover:text-pink-200"
          >
            ACTUALIZAR
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-pink-accent"></div>
          </div>
        ) : error ? (
          <p className="font-medium text-red-600">{error}</p>
        ) : sortedRecipes.length === 0 ? (
          <p className="italic text-gray-500">Todavia no tienes recetas publicadas en el laboratorio.</p>
        ) : (
          <div className="space-y-6">
            {sortedRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="group relative border-2 border-gray-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent/45 hover:shadow-[4px_4px_0px_0px_rgba(255,10,96,0.12)]"
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="h-24 w-full flex-shrink-0 overflow-hidden border border-gray-100 bg-gray-100 md:w-24">
                    <img
                      src={
                        getRecipeImage(recipe).includes('cloudinary.com')
                          ? getRecipeImage(recipe).replace('/upload/', '/upload/w_150,h_150,c_fill,f_auto,q_auto/')
                          : getRecipeImage(recipe)
                      }
                      alt={recipe.title}
                      className="h-full w-full object-cover grayscale transition-all duration-200 group-hover:grayscale-0"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900">{recipe.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase text-gray-500">
                          <span>{formatCategory(recipe.category)}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          <span>{difficultyLabels[normalizeDifficulty(recipe.difficulty)] || 'Media'}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          <span>{recipe.prepTime || 0} min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(recipe)}
                          className="flex items-center gap-1.5 border-2 border-gray-900 px-3 py-1.5 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent hover:bg-pink-50 hover:text-pink-accent dark:hover:border-pink-300 dark:hover:bg-pink-500/10 dark:hover:text-pink-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          EDITAR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(recipe._id)}
                          className="flex items-center gap-1.5 border-2 border-gray-900 px-3 py-1.5 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          BORRAR
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">{recipe.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingRecipe && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 recipe-modal-overlay" onClick={closeEditModal}>
          <Card
            className="modal-content-enter w-full max-w-5xl overflow-hidden rounded-none border-2 border-pink-accent bg-white p-0 shadow-[10px_10px_0px_0px_#ff0a60]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-pink-accent/15 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">NutraCore Lab</p>
                <h3 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Gajraj One', cursive" }}>
                  Editar receta
                </h3>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="modal-close-button flex h-11 w-11 items-center justify-center border-2 border-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent"
                aria-label="Cerrar edicion de receta"
              >
                <X className="modal-close-icon h-5 w-5" />
              </button>
            </div>

            <form className="max-h-[82vh] overflow-y-auto bg-gray-50 p-6 dark-pink-fields" onSubmit={handleSaveEdition}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
                <div className="space-y-5">
                  <Section
                    title="Contenido"
                    extra={<span className="text-xs font-bold uppercase text-gray-500">{draft.description.length}/{MAX_DESCRIPTION_CHARS}</span>}
                  >
                    <div className="space-y-2">
                      <label htmlFor="lab-edit-title" className={fieldLabelClass}>
                        Titulo
                      </label>
                      <input
                        id="lab-edit-title"
                        value={draft.title}
                        onChange={handleDraftChange('title')}
                        className={`${inputClass} h-11`}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lab-edit-description" className={fieldLabelClass}>
                        Descripcion
                      </label>
                      <textarea
                        id="lab-edit-description"
                        value={draft.description}
                        onChange={handleDraftChange('description')}
                        className={`${textareaClass} h-36`}
                        required
                      />
                    </div>
                  </Section>

                  <Section title="Estructura">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label htmlFor="lab-edit-category" className={fieldLabelClass}>
                          Categoria
                        </label>
                        <select
                          id="lab-edit-category"
                          value={draft.category}
                          onChange={handleDraftChange('category')}
                          className={`${inputClass} h-11`}
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {categoryLabels[category] || category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="lab-edit-difficulty" className={fieldLabelClass}>
                          Dificultad
                        </label>
                        <select
                          id="lab-edit-difficulty"
                          value={draft.difficulty}
                          onChange={handleDraftChange('difficulty')}
                          className={`${inputClass} h-11`}
                        >
                          {difficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficultyLabels[difficulty] || difficulty}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="lab-edit-time" className={fieldLabelClass}>
                          Tiempo (min)
                        </label>
                        <input
                          id="lab-edit-time"
                          type="number"
                          min="1"
                          max={MAX_PREP_TIME}
                          value={draft.prepTime}
                          onChange={handleDraftChange('prepTime')}
                          className={`${inputClass} h-11`}
                          required
                        />
                      </div>
                    </div>
                  </Section>

                  <Section
                    title="Ingredientes"
                    extra={<span className="text-xs font-bold uppercase text-gray-500">max {MAX_INGREDIENTS}</span>}
                  >
                    <label htmlFor="lab-edit-ingredients" className={fieldLabelClass}>
                      Uno por linea
                    </label>
                    <textarea
                      id="lab-edit-ingredients"
                      value={draft.ingredientsText}
                      onChange={handleDraftChange('ingredientsText')}
                      className={`${textareaClass} h-52`}
                    />
                  </Section>

                  <Section
                    title="Pasos"
                    extra={<span className="text-xs font-bold uppercase text-gray-500">max {MAX_STEPS} pasos / {MAX_STEP_WORDS} palabras</span>}
                  >
                    <label htmlFor="lab-edit-steps" className={fieldLabelClass}>
                      Uno por linea
                    </label>
                    <textarea
                      id="lab-edit-steps"
                      value={draft.stepsText}
                      onChange={handleDraftChange('stepsText')}
                      className={`${textareaClass} h-60`}
                    />
                  </Section>
                </div>

                <div className="space-y-5">
                  <Section title="Etiquetas">
                    <TagSelector
                      availableTags={availableTags}
                      selectedTags={Array.isArray(draft.tags) ? draft.tags : []}
                      onAddTag={addTag}
                      onRemoveTag={removeTag}
                      loading={loadingTags}
                    />
                  </Section>

                  <Section title="Imagenes">
                    <RecipeImageManager
                      images={draft.images}
                      onChange={(images) => setDraft((prev) => ({ ...prev, images: images.slice(0, MAX_RECIPE_IMAGES) }))}
                      folder="nutracore/recipes"
                      maxImages={MAX_RECIPE_IMAGES}
                      title="Imagenes de la receta"
                      helperText="Maximo 5 imagenes. Puedes eliminarlas o sustituirlas desde el mismo popup."
                    />
                  </Section>

                  <div className="border-2 border-pink-accent/20 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Resumen</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-500">Ingredientes</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {parseMultiline(draft.ingredientsText, { maxItems: MAX_INGREDIENTS }).length}
                        </p>
                      </div>
                      <div className="border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-500">Pasos</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {parseMultiline(draft.stepsText, { maxItems: MAX_STEPS, maxWords: MAX_STEP_WORDS }).length}
                        </p>
                      </div>
                      <div className="border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-500">Imagenes</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{draft.images.length}/{MAX_RECIPE_IMAGES}</p>
                      </div>
                      <div className="border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-500">Tiempo</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{draft.prepTime || 0} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t-2 border-pink-accent/10 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={savingEdition}
                  className="rounded-none border-2 border-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent hover:bg-pink-50 hover:text-pink-accent"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-none bg-pink-accent text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-pink-accent/92 hover:shadow-[4px_4px_0px_0px_rgba(255,10,96,0.24)]"
                  disabled={savingEdition}
                >
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
