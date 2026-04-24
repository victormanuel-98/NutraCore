import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CloudinaryUploadWidget } from '../ui/CloudinaryUploadWidget';
import { getIngredientNutritionProfile, searchIngredients } from '../../services/ingredientService';

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

const initialForm = {
  title: '',
  description: '',
  ingredients: [''],
  steps: [''],
  category: 'desayuno',
  prepTime: 20,
  difficulty: 'fácil',
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  },
  tags: '',
  images: []
};

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const normalizeForSubmit = (form, ingredientPortions) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  ingredients: form.ingredients
    .map((item, index) => {
      const ingredientName = item.trim();
      if (!ingredientName) return '';

      const portion = ingredientPortions[index] || defaultIngredientPortion;
      const quantity = toPositiveNumber(portion.quantity);
      const unitLabel = ingredientUnits.find((unit) => unit.value === portion.unit)?.label || portion.unit;

      if (!quantity) return ingredientName;
      return `${ingredientName} (${quantity} ${unitLabel})`;
    })
    .filter(Boolean),
  steps: form.steps.map((item) => item.trim()).filter(Boolean),
  category: form.category,
  prepTime: Number(form.prepTime),
  difficulty: form.difficulty,
  images: form.images,
  nutrition: {
    calories: toPositiveNumber(form.nutrition.calories),
    protein: toPositiveNumber(form.nutrition.protein),
    carbs: toPositiveNumber(form.nutrition.carbs),
    fats: toPositiveNumber(form.nutrition.fats)
  },
  tags: form.tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
});

export function RecipeForm({ onSubmit, isSubmitting = false }) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [ingredientSuggestions, setIngredientSuggestions] = useState({});
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);
  const [loadingIngredientIndex, setLoadingIngredientIndex] = useState(null);
  const [ingredientProfiles, setIngredientProfiles] = useState({});
  const [loadingProfileIndex, setLoadingProfileIndex] = useState(null);
  const [profileCache, setProfileCache] = useState({});
  const [ingredientPortions, setIngredientPortions] = useState({ 0: defaultIngredientPortion });

  const imagePreviews = useMemo(() => form.images.slice(0, 5), [form.images]);
  const computedNutrition = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };

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

        setIngredientSuggestions((prev) => ({
          ...prev,
          [activeIngredientIndex]: suggestions
        }));

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
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [activeIngredientIndex, form.ingredients]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      nutrition: {
        calories: computedNutrition.calories,
        protein: computedNutrition.protein,
        carbs: computedNutrition.carbs,
        fats: computedNutrition.fats
      }
    }));
  }, [computedNutrition]);

  const getSuggestionMatch = (index, value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return null;

    const candidates = ingredientSuggestions[index] || [];
    return candidates.find((item) => String(item.name || '').trim().toLowerCase() === normalized) || null;
  };

  const clearIngredientProfile = (index) => {
    setIngredientProfiles((prev) => {
      if (!prev[index]) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const syncIngredientProfileFromSuggestion = async (index, suggestion) => {
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
  };

  const syncIngredientProfile = async (index, rawValue) => {
    const safeValue = String(rawValue || '').trim();
    if (safeValue.length < 2) {
      clearIngredientProfile(index);
      return;
    }

    let suggestion = getSuggestionMatch(index, rawValue);
    if (!suggestion) {
      const suggestions = ingredientSuggestions[index] || [];
      if (suggestions.length > 0) {
        suggestion = suggestions[0];
      }
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
        // Ignoramos error de lookup puntual y dejamos limpieza abajo.
      }
    }

    if (!suggestion) {
      clearIngredientProfile(index);
      return;
    }

    await syncIngredientProfileFromSuggestion(index, suggestion);
  };

  const updateArrayItem = (field, index, value) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const updateIngredientPortion = (index, field, value) => {
    setIngredientPortions((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || defaultIngredientPortion),
        [field]: value
      }
    }));
  };

  const reindexNumericMap = (source, removedIndex) => {
    const next = {};
    Object.keys(source).forEach((key) => {
      const keyNumber = Number(key);
      if (!Number.isFinite(keyNumber) || keyNumber === removedIndex) return;
      const newKey = keyNumber > removedIndex ? keyNumber - 1 : keyNumber;
      next[newKey] = source[key];
    });
    return next;
  };

  const addArrayItem = (field) => {
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

    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
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
  };

  const handleImageUploadSuccess = (url) => {
    setForm((prev) => {
      const nextImages = [...prev.images, url].slice(0, 5);
      return { ...prev, images: nextImages };
    });
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const payload = normalizeForSubmit(form, ingredientPortions);

    if (!payload.title || !payload.description) {
      setFormError('Debes completar título y descripción');
      return;
    }

    if (payload.ingredients.length === 0 || payload.steps.length === 0) {
      setFormError('Debes añadir al menos un ingrediente y un paso');
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

    if (!payload.prepTime || payload.prepTime < 1) {
      setFormError('El tiempo de preparación debe ser mayor que 0');
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
      setFormError(error.message || 'No se pudo publicar la receta');
    }
  };

  return (
    <Card className="p-6 bg-white border border-pink-accent/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Publicar receta</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ej: Bowl energético de quinoa"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe la receta y para quién está pensada"
              className="min-h-24 w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificultad</Label>
            <select
              id="difficulty"
              value={form.difficulty}
              onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prepTime">Tiempo de preparación (min)</Label>
            <Input
              id="prepTime"
              type="number"
              min="1"
              value={form.prepTime}
              onChange={(event) => setForm((prev) => ({ ...prev, prepTime: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separados por coma)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="alta proteína, rápido, sin gluten"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ingredientes</h3>
            <Button type="button" variant="outline" onClick={() => addArrayItem('ingredients')}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>
          <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_120px_130px_auto] gap-2 text-xs text-gray-500">
            <span>Ingrediente</span>
            <span>Cantidad</span>
            <span>Unidad</span>
            <span></span>
          </div>

          {form.ingredients.map((item, index) => (
            <div key={`ingredient-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_130px_auto]">
              <div className="flex-1 space-y-1">
                <Input
                  value={item}
                  list={`ingredient-suggestions-${index}`}
                  onFocus={() => setActiveIngredientIndex(index)}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateArrayItem('ingredients', index, nextValue);
                    setActiveIngredientIndex(index);
                    syncIngredientProfile(index, nextValue);
                  }}
                  onBlur={(event) => syncIngredientProfile(index, event.target.value)}
                  placeholder={`Ingrediente ${index + 1}`}
                />
                <datalist id={`ingredient-suggestions-${index}`}>
                  {(ingredientSuggestions[index] || []).map((suggestion) => (
                    <option key={`${suggestion.id}-${suggestion.name}`} value={suggestion.name} />
                  ))}
                </datalist>
                {loadingIngredientIndex === index && (
                  <p className="text-xs text-gray-500">Buscando ingredientes en Open Food Facts...</p>
                )}
                {loadingProfileIndex === index && (
                  <p className="text-xs text-gray-500">Calculando macros medias del ingrediente...</p>
                )}
                {ingredientProfiles[index]?.averageMacros && (
                  <>
                    <p className="text-xs text-green-700">
                      Media (100g): {ingredientProfiles[index].averageMacros.calories} kcal | P{' '}
                      {ingredientProfiles[index].averageMacros.proteins}g | C {ingredientProfiles[index].averageMacros.carbs}
                      g | G {ingredientProfiles[index].averageMacros.fats}g
                    </p>
                    <p className="text-xs text-gray-600">
                      Aporte actual: {Math.round(
                        (Number(ingredientProfiles[index].averageMacros.calories || 0) *
                          toPositiveNumber(ingredientPortions[index]?.quantity || 0) *
                          (unitToGrams[ingredientPortions[index]?.unit] || 0)) /
                          100
                      )}{' '}
                      kcal
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientPortions[index]?.quantity ?? defaultIngredientPortion.quantity}
                  onChange={(event) => updateIngredientPortion(index, 'quantity', event.target.value)}
                  placeholder="Cantidad"
                />
              </div>

              <div className="space-y-1">
                <select
                  value={ingredientPortions[index]?.unit ?? defaultIngredientPortion.unit}
                  onChange={(event) => updateIngredientPortion(index, 'unit', event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                >
                  {ingredientUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="button" variant="outline" className="h-10" onClick={() => removeArrayItem('ingredients', index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pasos</h3>
            <Button type="button" variant="outline" onClick={() => addArrayItem('steps')}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>

          {form.steps.map((item, index) => (
            <div key={`step-${index}`} className="flex gap-2">
              <textarea
                value={item}
                onChange={(event) => updateArrayItem('steps', index, event.target.value)}
                placeholder={`Paso ${index + 1}`}
                className="min-h-20 flex-1 rounded-md border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
              />
              <Button type="button" variant="outline" className="self-start" onClick={() => removeArrayItem('steps', index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Valores nutricionales</h3>
          <p className="text-xs text-gray-600">Cálculo automático según ingredientes y cantidad. Estos campos no se pueden editar.</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorías</Label>
              <Input id="calories" type="number" min="0" value={form.nutrition.calories} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input id="protein" type="number" min="0" value={form.nutrition.protein} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" type="number" min="0" value={form.nutrition.carbs} readOnly disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Grasas (g)</Label>
              <Input id="fats" type="number" min="0" value={form.nutrition.fats} readOnly disabled className="bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Imágenes de la receta (máximo 5)</Label>
          <CloudinaryUploadWidget 
            onUploadSuccess={handleImageUploadSuccess}
            multiple={true}
            folder="nutracore/recipes"
          >
            <div className="flex items-center justify-center gap-2 border border-dashed border-pink-accent/40 rounded-md p-4 cursor-pointer hover:bg-pink-50/40 transition-colors">
              <Upload className="w-4 h-4 text-pink-accent" />
              <span className="text-sm text-gray-700">Subir imágenes a Cloudinary</span>
            </div>
          </CloudinaryUploadWidget>

          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {form.images.map((image, index) => (
                <div key={`preview-${index}`} className="relative group">
                  <img 
                    src={image} 
                    alt={`preview-${index}`} 
                    className="h-24 w-full rounded-md object-cover border border-gray-200" 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <Button
          type="submit"
          className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white h-11"
          disabled={isSubmitting || uploadingImages}
        >
          {isSubmitting ? 'Publicando receta...' : 'Publicar receta'}
        </Button>
      </form>
    </Card>
  );
}

