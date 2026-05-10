import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RecipeImageManager } from './RecipeImageManager';
import { getIngredientNutritionProfile, searchIngredients } from '../../services/ingredientService';
import { getAvailableRecipeTags, getRecipeMutationErrorMessage } from '../../services/recipeService';

const categories = ['desayuno', 'almuerzo/cena', 'merienda', 'snack', 'post-entreno', 'cena ligera'];
const difficulties = ['fácil', 'media', 'difícil'];
const ingredientUnits = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'taza', label: 'taza' },
  { value: 'cucharada', label: 'cda' },
  { value: 'cucharadita', label: 'cdta' },
  { value: 'unidad', label: 'unidad' }
];

const unitToGrams = {
  g: 1,
  kg: 1000,
  ml: 1,
  taza: 240,
  cucharada: 15,
  cucharadita: 5,
  unidad: 100
};

const defaultIngredientPortion = {
  quantity: '100',
  unit: 'g'
};

const MAX_RECIPE_TAGS = 3;
const MAX_RECIPE_IMAGES = 5;
const MAX_INGREDIENTS = 20;
const MAX_STEPS = 20;
const MAX_PREP_TIME = 999;
const MAX_STEP_WORDS = 80;
const MAX_DESCRIPTION_CHARS = 1200;

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

const initialForm = {
  title: '',
  description: '',
  ingredients: [''],
  steps: [''],
  category: 'desayuno',
  prepTime: 20,
  difficulty: 'fácil',
  tags: [],
  images: []
};

const fieldLabelClass = 'uppercase font-bold text-xs tracking-widest text-gray-700';
const baseFieldClass = 'w-full border-2 border-gray-900 rounded-none bg-white px-3 text-sm text-gray-900 outline-none transition-all duration-150 hover:border-pink-accent hover:bg-pink-50/40 focus:border-pink-accent dark:hover:border-pink-300 dark:hover:bg-pink-500/8';
const textareaFieldClass = `${baseFieldClass} p-3 resize-none overflow-y-auto`;

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const filterBadWords = (text = '') => {
  let filtered = String(text || '');
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

const clampNumberInput = (value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(min);
  return String(Math.max(min, Math.min(max, parsed)));
};

const trimWords = (value, maxWords) => {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const words = normalized.split(' ');
  return words.length <= maxWords ? normalized : words.slice(0, maxWords).join(' ');
};

const normalizeForSubmit = (form, ingredientPortions, nutrition) => ({
  title: filterBadWords(form.title.trim()),
  description: filterBadWords(form.description.trim()),
  ingredients: form.ingredients
    .map((item, index) => {
      const ingredientName = filterBadWords(item.trim());
      if (!ingredientName) return '';

      const portion = ingredientPortions[index] || defaultIngredientPortion;
      const quantity = toPositiveNumber(portion.quantity);
      const unitLabel = ingredientUnits.find((unit) => unit.value === portion.unit)?.label || portion.unit;

      if (!quantity) return ingredientName;
      return `${ingredientName} (${quantity} ${unitLabel})`;
    })
    .filter(Boolean)
    .slice(0, MAX_INGREDIENTS),
  steps: form.steps.map((item) => filterBadWords(trimWords(item, MAX_STEP_WORDS))).filter(Boolean).slice(0, MAX_STEPS),
  category: form.category,
  prepTime: Number(clampNumberInput(form.prepTime, { min: 1, max: MAX_PREP_TIME })),
  difficulty: form.difficulty,
  images: Array.isArray(form.images) ? form.images.slice(0, MAX_RECIPE_IMAGES) : [],
  nutrition: {
    calories: toPositiveNumber(nutrition.calories),
    protein: toPositiveNumber(nutrition.protein),
    carbs: toPositiveNumber(nutrition.carbs),
    fats: toPositiveNumber(nutrition.fats)
  },
  tags: Array.isArray(form.tags) ? form.tags.slice(0, MAX_RECIPE_TAGS) : []
});

function CustomSelect({ value, onChange, options, placeholder, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = containerRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);
      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const estimatedHeight = Math.min(options.length * 40, 240);
      const shouldOpenUp = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;

      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        top: shouldOpenUp ? Math.max(8, rect.top - estimatedHeight - 4) : rect.bottom + 4,
        width: rect.width,
        maxHeight: estimatedHeight,
        zIndex: 140
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, options.length]);

  const selectedOption = options.find((opt) => (opt.value || opt) === value);
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption) : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="lab-select-trigger font-slogan h-11 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-medium flex items-center justify-between bg-white hover:bg-pink-50/40 hover:border-pink-accent transition-colors dark:hover:bg-pink-500/8 dark:hover:border-pink-300"
      >
        <span>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && menuStyle && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="lab-select-menu font-slogan overflow-auto border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_#ff0a60]"
        >
          {options.map((opt) => {
            const val = opt.value || opt;
            const label = opt.label || opt;
            return (
              <div
                key={val}
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`lab-select-item px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === val ? 'bg-pink-accent text-white' : 'hover:bg-pink-50 text-gray-900 dark:hover:bg-pink-500/10'
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

const formatTagLabel = (tag) => String(tag || '').replace(/-/g, ' ').toUpperCase();

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
          className="lab-select-trigger font-slogan h-11 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-medium flex items-center justify-between bg-white hover:bg-pink-50/40 hover:border-pink-accent transition-colors uppercase disabled:opacity-60 disabled:cursor-not-allowed dark:hover:bg-pink-500/8 dark:hover:border-pink-300"
        >
          <span>{loading ? 'Cargando tags...' : 'Añadir tag'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && canAddMore && !loading && (
          <div className="lab-select-menu absolute z-50 mt-1 w-full border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_#ff0a60] max-h-56 overflow-auto">
            {remainingTags.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-600">No quedan tags disponibles.</p>
            ) : (
              remainingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onAddTag(tag);
                    setIsOpen(false);
                  }}
                  className="lab-select-item font-slogan w-full text-left px-3 py-2 text-sm uppercase text-gray-900 hover:bg-pink-50 transition-colors dark:hover:bg-pink-500/10"
                >
                  {formatTagLabel(tag)}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="lab-tag-field flex flex-wrap gap-2 min-h-[2.75rem] max-h-28 overflow-y-auto border-2 border-gray-900 rounded-none p-2 bg-white">
        {selectedTags.length === 0 ? (
          <span className="text-xs text-gray-500 uppercase">Sin tags seleccionados</span>
        ) : (
          selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 border border-pink-accent text-pink-accent text-xs font-bold uppercase">
              {formatTagLabel(tag)}
              <button type="button" onClick={() => onRemoveTag(tag)} className="hover:text-pink-700" aria-label={`Quitar tag ${tag}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 uppercase">
        {selectedTags.length}/{MAX_RECIPE_TAGS} tags seleccionados
      </p>
    </div>
  );
}

export function RecipeForm({ onSubmit, isSubmitting = false }) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState({});
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);
  const [loadingIngredientIndex, setLoadingIngredientIndex] = useState(null);
  const [ingredientProfiles, setIngredientProfiles] = useState({});
  const [loadingProfileIndex, setLoadingProfileIndex] = useState(null);
  const [profileCache, setProfileCache] = useState({});
  const [ingredientPortions, setIngredientPortions] = useState({ 0: defaultIngredientPortion });
  const [availableTags, setAvailableTags] = useState(FALLBACK_RECIPE_TAGS);
  const [loadingTags, setLoadingTags] = useState(true);
  const titleRef = useRef(null);
  const stepRefs = useRef([]);
  const pendingStepFocusRef = useRef(null);

  const computedNutrition = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    Object.entries(ingredientProfiles).forEach(([index, profile]) => {
      const macros = profile?.averageMacros;
      if (!macros) return;

      const portion = ingredientPortions[index] || defaultIngredientPortion;
      const quantity = toPositiveNumber(portion.quantity);
      const gramsFactor = unitToGrams[portion.unit] || 0;
      const grams = quantity * gramsFactor;
      if (!grams) return;

      const multiplier = grams / 100;
      totals.calories += Number(macros.calories || 0) * multiplier;
      totals.protein += Number(macros.proteins || 0) * multiplier;
      totals.carbs += Number(macros.carbs || 0) * multiplier;
      totals.fats += Number(macros.fats || 0) * multiplier;
    });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10
    };
  }, [ingredientProfiles, ingredientPortions]);

  useEffect(() => {
    let isMounted = true;

    const loadAvailableTags = async () => {
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

    loadAvailableTags();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeIngredientIndex === null) return undefined;

    const currentValue = form.ingredients[activeIngredientIndex] || '';
    const query = currentValue.trim();

    if (query.length < 2) {
      setIngredientSuggestions((prev) => ({ ...prev, [activeIngredientIndex]: [] }));
      setLoadingIngredientIndex(null);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoadingIngredientIndex(activeIngredientIndex);
        const response = await searchIngredients(query, 8);
        const suggestions = Array.isArray(response?.data) ? response.data : [];

        setIngredientSuggestions((prev) => ({ ...prev, [activeIngredientIndex]: suggestions }));

        if (suggestions.length > 0) {
          const typedValue = (form.ingredients[activeIngredientIndex] || '').trim().toLowerCase();
          const exact = suggestions.find((item) => String(item.name || '').trim().toLowerCase() === typedValue);
          await syncIngredientProfileFromSuggestion(activeIngredientIndex, exact || suggestions[0]);
        } else {
          clearIngredientProfile(activeIngredientIndex);
        }
      } catch {
        setIngredientSuggestions((prev) => ({ ...prev, [activeIngredientIndex]: [] }));
        clearIngredientProfile(activeIngredientIndex);
      } finally {
        setLoadingIngredientIndex(null);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [activeIngredientIndex, form.ingredients]);

  const getSuggestionMatch = useCallback((index, value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return null;
    const candidates = ingredientSuggestions[index] || [];
    return candidates.find((item) => String(item.name || '').trim().toLowerCase() === normalized) || null;
  }, [ingredientSuggestions]);

  const clearIngredientProfile = useCallback((index) => {
    setIngredientProfiles((prev) => {
      if (!prev[index]) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, []);

  const syncIngredientProfileFromSuggestion = useCallback(async (index, suggestion) => {
    if (!suggestion) return;
    const profileKey = suggestion.id || suggestion.name;
    const cachedProfile = profileCache[profileKey];

    if (cachedProfile) {
      setIngredientProfiles((prev) => ({ ...prev, [index]: cachedProfile }));
      return;
    }

    try {
      setLoadingProfileIndex(index);
      const response = await getIngredientNutritionProfile({
        id: suggestion.id,
        name: suggestion.name,
        nameEn: suggestion.nameEn
      });

      const profile = response?.data;
      if (!profile?.averageMacros) {
        clearIngredientProfile(index);
        return;
      }

      setProfileCache((prev) => ({ ...prev, [profileKey]: profile }));
      setIngredientProfiles((prev) => ({ ...prev, [index]: profile }));
    } catch {
      clearIngredientProfile(index);
    } finally {
      setLoadingProfileIndex(null);
    }
  }, [clearIngredientProfile, profileCache]);

  const syncIngredientProfile = useCallback(async (index, rawValue) => {
    const safeValue = String(rawValue || '').trim();
    if (safeValue.length < 2) {
      clearIngredientProfile(index);
      return;
    }

    let suggestion = getSuggestionMatch(index, rawValue);
    if (!suggestion) {
      const suggestions = ingredientSuggestions[index] || [];
      if (suggestions.length > 0) suggestion = suggestions[0];
    }

    if (!suggestion) {
      try {
        const response = await searchIngredients(safeValue, 5);
        const fallbackSuggestions = Array.isArray(response?.data) ? response.data : [];
        if (fallbackSuggestions.length > 0) {
          setIngredientSuggestions((prev) => ({ ...prev, [index]: fallbackSuggestions }));
          suggestion = fallbackSuggestions[0];
        }
      } catch {
        // lookup best-effort
      }
    }

    if (!suggestion) {
      clearIngredientProfile(index);
      return;
    }

    await syncIngredientProfileFromSuggestion(index, suggestion);
  }, [clearIngredientProfile, getSuggestionMatch, ingredientSuggestions, syncIngredientProfileFromSuggestion]);

  const updateArrayItem = useCallback((field, index, value) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  }, []);

  const addTag = useCallback((tag) => {
    if (!tag) return;
    setForm((prev) => {
      if (!Array.isArray(prev.tags)) return { ...prev, tags: [tag] };
      if (prev.tags.includes(tag) || prev.tags.length >= MAX_RECIPE_TAGS) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
  }, []);

  const removeTag = useCallback((tag) => {
    setForm((prev) => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.filter((entry) => entry !== tag) : []
    }));
  }, []);

  const focusStepInput = useCallback((index) => {
    const target = stepRefs.current[index];
    if (!target) return;
    target.focus();
    const caretPosition = target.value.length;
    target.setSelectionRange(caretPosition, caretPosition);
  }, []);

  const updateIngredientPortion = useCallback((index, field, value) => {
    setIngredientPortions((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || defaultIngredientPortion),
        [field]: value
      }
    }));
  }, []);

  const reindexNumericMap = useCallback((source, removedIndex) => {
    const next = {};
    Object.keys(source).forEach((key) => {
      const keyNumber = Number(key);
      if (!Number.isFinite(keyNumber) || keyNumber === removedIndex) return;
      const newKey = keyNumber > removedIndex ? keyNumber - 1 : keyNumber;
      next[newKey] = source[key];
    });
    return next;
  }, []);

  const addArrayItem = useCallback((field) => {
    if (field === 'ingredients' && form.ingredients.length >= MAX_INGREDIENTS) return;
    if (field === 'ingredients') {
      setForm((prev) => {
        const nextIndex = prev.ingredients.length;
        setIngredientPortions((prevPortions) => ({
          ...prevPortions,
          [nextIndex]: defaultIngredientPortion
        }));
        return { ...prev, ingredients: [...prev.ingredients, ''] };
      });
      return;
    }

    if (field === 'steps' && form.steps.length >= MAX_STEPS) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  }, [form.ingredients.length, form.steps.length]);

  const addStep = useCallback(({ afterIndex = null, shouldFocus = true } = {}) => {
    setForm((prev) => {
      if (prev.steps.length >= MAX_STEPS) return prev;
      const nextSteps = [...prev.steps];
      const insertAt = Number.isInteger(afterIndex) && afterIndex >= 0 && afterIndex < nextSteps.length ? afterIndex + 1 : nextSteps.length;
      nextSteps.splice(insertAt, 0, '');
      if (shouldFocus) pendingStepFocusRef.current = insertAt;
      return { ...prev, steps: nextSteps };
    });
  }, []);

  const handleStepChange = useCallback((index, value) => {
    const cleanValue = filterBadWords(value);
    const normalizedValue = trimWords(String(cleanValue || '').replace(/\s{2,}/g, ' '), MAX_STEP_WORDS);

    if (!cleanValue.includes('\n')) {
      updateArrayItem('steps', index, normalizedValue);
      return;
    }

    const paragraphs = cleanValue
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (paragraphs.length <= 1) {
      updateArrayItem('steps', index, trimWords(cleanValue.replace(/\r?\n/g, ' '), MAX_STEP_WORDS));
      return;
    }

    setForm((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = trimWords(paragraphs[0], MAX_STEP_WORDS);
      nextSteps.splice(index + 1, 0, ...paragraphs.slice(1).map((item) => trimWords(item, MAX_STEP_WORDS)));
      return { ...prev, steps: nextSteps.slice(0, MAX_STEPS) };
    });

    pendingStepFocusRef.current = Math.min(index + paragraphs.length - 1, MAX_STEPS - 1);
  }, [updateArrayItem]);

  const handleStepKeyDown = useCallback((index) => (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();

    const currentStep = String(form.steps[index] || '').trim();
    if (!currentStep) return;

    const nextIndex = index + 1;
    if (form.steps[nextIndex] !== undefined) {
      focusStepInput(nextIndex);
      return;
    }

    addStep({ afterIndex: index, shouldFocus: true });
  }, [addStep, focusStepInput, form.steps]);

  const removeArrayItem = useCallback((field, index) => {
    if (field === 'ingredients' && form.ingredients.length === 1) return;
    if (field === 'steps' && form.steps.length === 1) return;

    setForm((prev) => {
      if (prev[field].length === 1) return prev;
      const next = prev[field].filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, [field]: next };
    });

    if (field === 'ingredients') {
      setIngredientSuggestions((prev) => reindexNumericMap(prev, index));
      setIngredientProfiles((prev) => reindexNumericMap(prev, index));
      setIngredientPortions((prev) => reindexNumericMap(prev, index));
    }
  }, [form.ingredients.length, form.steps.length, reindexNumericMap]);

  useEffect(() => {
    if (pendingStepFocusRef.current === null) return;
    const nextIndex = pendingStepFocusRef.current;
    pendingStepFocusRef.current = null;

    const rafId = window.requestAnimationFrame(() => {
      focusStepInput(nextIndex);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [focusStepInput, form.steps]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const payload = normalizeForSubmit(form, ingredientPortions, computedNutrition);

    if (!payload.title || !payload.description) {
      setFormError('Debes completar título y descripción');
      return;
    }
    if (payload.ingredients.length === 0 || payload.steps.length === 0) {
      setFormError('Debes añadir al menos un ingrediente y un paso');
      return;
    }
    if (payload.ingredients.length > MAX_INGREDIENTS) {
      setFormError(`Máximo ${MAX_INGREDIENTS} ingredientes.`);
      return;
    }
    if (payload.steps.length > MAX_STEPS) {
      setFormError(`Máximo ${MAX_STEPS} pasos.`);
      return;
    }
    if (payload.tags.length > MAX_RECIPE_TAGS) {
      setFormError('Solo puedes seleccionar hasta 3 tags.');
      return;
    }

    const hasInvalidQuantity = form.ingredients.some((ingredient, index) => {
      if (!String(ingredient).trim()) return false;
      const quantity = toPositiveNumber(ingredientPortions[index]?.quantity);
      return quantity <= 0;
    });

    if (hasInvalidQuantity) {
      setFormError('Cada ingrediente debe tener una cantidad mayor que 0');
      return;
    }

    if (!payload.prepTime || payload.prepTime < 1 || payload.prepTime > MAX_PREP_TIME) {
      setFormError(`El tiempo de preparación debe estar entre 1 y ${MAX_PREP_TIME} minutos`);
      return;
    }

    try {
      await onSubmit(payload);
      setForm(initialForm);
      setIngredientSuggestions({});
      setIngredientProfiles({});
      setIngredientPortions({ 0: defaultIngredientPortion });
      setActiveIngredientIndex(null);
    } catch (error) {
      setFormError(getRecipeMutationErrorMessage(error, { action: 'create' }));
    }
  };

  return (
    <Card className="p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-tight" style={{ fontFamily: "'Gajraj One', cursive" }}>
        Nutra<span className="text-pink-accent">Core</span> Lab
      </h2>

      <form className="space-y-6 lab-recipe-form" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title" className={fieldLabelClass}>Título</Label>
            <input
              id="title"
              ref={titleRef}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: filterBadWords(event.target.value).slice(0, 120) }))}
              placeholder="Ej: Bowl energético de quinoa"
              className={`${baseFieldClass} h-11`}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className={fieldLabelClass}>Descripción</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: filterBadWords(event.target.value).slice(0, MAX_DESCRIPTION_CHARS) }))}
              placeholder="Describe tu creación..."
              className={`${textareaFieldClass} h-32`}
              required
            />
            <p className="text-xs text-gray-500">{form.description.length}/{MAX_DESCRIPTION_CHARS} caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className={fieldLabelClass}>Categoría</Label>
            <CustomSelect value={form.category} onChange={(val) => setForm((prev) => ({ ...prev, category: val }))} options={categories} placeholder="Seleccionar..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className={fieldLabelClass}>Dificultad</Label>
            <CustomSelect value={form.difficulty} onChange={(val) => setForm((prev) => ({ ...prev, difficulty: val }))} options={difficulties} placeholder="Seleccionar..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prepTime" className={fieldLabelClass}>Tiempo (min)</Label>
            <input
              id="prepTime"
              type="number"
              min="1"
              max={MAX_PREP_TIME}
              value={form.prepTime}
              onChange={(event) => setForm((prev) => ({ ...prev, prepTime: clampNumberInput(event.target.value, { min: 1, max: MAX_PREP_TIME }) }))}
              className={`${baseFieldClass} h-11`}
              required
            />
            <p className="text-xs text-gray-500">Máximo {MAX_PREP_TIME} min.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className={fieldLabelClass}>Tags</Label>
            <TagSelector
              availableTags={availableTags}
              selectedTags={Array.isArray(form.tags) ? form.tags : []}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              loading={loadingTags}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ingredientes</h3>
            <p className="text-xs text-gray-500 uppercase">{form.ingredients.length}/{MAX_INGREDIENTS}</p>
          </div>

          <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_120px_130px_auto] gap-2 text-xs text-gray-500">
            <span>Ingrediente</span>
            <span>Cantidad</span>
            <span>Unidad</span>
            <span></span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {form.ingredients.map((item, index) => (
              <div key={`ingredient-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_130px_auto]">
                <div className="flex-1 space-y-1">
                  <input
                    value={item}
                    list={`ingredient-suggestions-${index}`}
                    onFocus={() => setActiveIngredientIndex(index)}
                    onChange={(event) => {
                      const nextValue = filterBadWords(event.target.value).slice(0, 120);
                      updateArrayItem('ingredients', index, nextValue);
                      setActiveIngredientIndex(index);
                    }}
                    onBlur={(event) => syncIngredientProfile(index, event.target.value)}
                    placeholder={`Ingrediente ${index + 1}`}
                    className={`${baseFieldClass} h-10`}
                  />
                  <datalist id={`ingredient-suggestions-${index}`}>
                    {(ingredientSuggestions[index] || []).map((suggestion) => (
                      <option key={`${suggestion.id}-${suggestion.name}`} value={suggestion.name} />
                    ))}
                  </datalist>
                  {loadingIngredientIndex === index && <p className="text-xs text-gray-500">Buscando ingredientes en Open Food Facts...</p>}
                  {loadingProfileIndex === index && <p className="text-xs text-gray-500">Calculando macros medias del ingrediente...</p>}
                  {ingredientProfiles[index]?.averageMacros && (
                    <>
                      <p className="text-xs text-green-700">
                        Media (100g): {ingredientProfiles[index].averageMacros.calories} kcal | P {ingredientProfiles[index].averageMacros.proteins}g | C {ingredientProfiles[index].averageMacros.carbs}g | G {ingredientProfiles[index].averageMacros.fats}g
                      </p>
                      <p className="text-xs text-gray-600">
                        Aporte actual: {Math.round((Number(ingredientProfiles[index].averageMacros.calories || 0) * toPositiveNumber(ingredientPortions[index]?.quantity || 0) * (unitToGrams[ingredientPortions[index]?.unit] || 0)) / 100)} kcal
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredientPortions[index]?.quantity ?? defaultIngredientPortion.quantity}
                    onChange={(event) => updateIngredientPortion(index, 'quantity', event.target.value)}
                    placeholder="Cant"
                    className={`${baseFieldClass} h-10`}
                  />
                </div>

                <div className="space-y-1">
                  <CustomSelect
                    value={ingredientPortions[index]?.unit ?? defaultIngredientPortion.unit}
                    onChange={(val) => updateIngredientPortion(index, 'unit', val)}
                    options={ingredientUnits}
                    placeholder="Unidad"
                  />
                </div>

                <Button type="button" variant="outline" className="h-10 border-2 border-gray-900 rounded-none hover:bg-red-500 hover:text-white" onClick={() => removeArrayItem('ingredients', index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('ingredients')}
            disabled={form.ingredients.length >= MAX_INGREDIENTS}
            className="w-full rounded-none border-2 border-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir ingrediente
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pasos</h3>
            <p className="text-xs text-gray-500 uppercase">{form.steps.length}/{MAX_STEPS}</p>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {form.steps.map((item, index) => (
              <div key={`step-${index}`} className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <textarea
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                    value={item}
                    onChange={(event) => handleStepChange(index, event.target.value)}
                    onKeyDown={handleStepKeyDown(index)}
                    placeholder={`Paso ${index + 1}: explica el proceso...`}
                    className={`${textareaFieldClass} h-28`}
                  />
                  <p className="text-xs text-gray-500">
                    {String(item || '').trim() ? String(item || '').trim().split(/\s+/).length : 0}/{MAX_STEP_WORDS} palabras
                  </p>
                </div>

                <Button type="button" variant="outline" className="self-start border-2 border-gray-900 rounded-none h-10 hover:bg-red-500 hover:text-white" onClick={() => removeArrayItem('steps', index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => addStep()}
            disabled={form.steps.length >= MAX_STEPS}
            className="w-full rounded-none border-2 border-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir paso
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Valores nutricionales</h3>
          <p className="text-xs text-gray-600">Cálculo automático según ingredientes y cantidad. Estos campos no se pueden editar.</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorías</Label>
              <Input id="calories" type="number" min="0" value={computedNutrition.calories} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input id="protein" type="number" min="0" value={computedNutrition.protein} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" type="number" min="0" value={computedNutrition.carbs} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Grasas (g)</Label>
              <Input id="fats" type="number" min="0" value={computedNutrition.fats} readOnly disabled className="bg-gray-100" />
            </div>
          </div>
        </div>

        <RecipeImageManager
          images={form.images}
          onChange={(nextImages) => setForm((prev) => ({ ...prev, images: nextImages.slice(0, MAX_RECIPE_IMAGES) }))}
        />

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <Button
          type="submit"
          className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white h-12 rounded-none border-b-4 border-r-4 border-pink-900/30 transition-all hover:translate-y-[-2px] active:translate-y-[2px]"
          disabled={isSubmitting}
        >
          <span className="font-bold tracking-wider">{isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR RECETA'}</span>
        </Button>
      </form>
    </Card>
  );
}
