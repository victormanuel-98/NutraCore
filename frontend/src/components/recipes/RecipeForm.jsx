import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Plus, Trash2, Upload, ChevronDown } from 'lucide-react';
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
  tags: '',
  images: []
};

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const normalizeForSubmit = (form, ingredientPortions, nutrition) => ({
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
    calories: toPositiveNumber(nutrition.calories),
    protein: toPositiveNumber(nutrition.protein),
    carbs: toPositiveNumber(nutrition.carbs),
    fats: toPositiveNumber(nutrition.fats)
  },
  tags: form.tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
});

function CustomSelect({ value, onChange, options, placeholder, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => (opt.value || opt) === value);
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption) : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-sans font-medium flex items-center justify-between bg-white hover:bg-gray-50 transition-colors uppercase"
      >
        <span>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_#ff0a60] max-h-60 overflow-auto">
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
                className={`px-3 py-2 text-sm font-sans cursor-pointer transition-colors uppercase
                  ${value === val ? 'bg-pink-accent text-white' : 'hover:bg-pink-50 text-gray-900'}
                `}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [localTitle, setLocalTitle] = useState(form.title);
  const [localDescription, setLocalDescription] = useState(form.description);
  const titleRef = useRef(null);

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

  // Remove the useEffect that synced computedNutrition to form.nutrition
  // and just use computedNutrition directly in the UI and submit handler.

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
  }, [profileCache, clearIngredientProfile]);

  const syncIngredientProfile = useCallback(async (index, rawValue) => {
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
  }, [clearIngredientProfile, getSuggestionMatch, ingredientSuggestions, syncIngredientProfileFromSuggestion]);

  const updateArrayItem = useCallback((field, index, value) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
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
  }, []);

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

  const handleImageUploadSuccess = useCallback((url) => {
    // Simulación de validación IA para asegurar que es un plato de comida
    setUploadingImages(true);
    
    // En una implementación real, aquí llamaríamos a un servicio de IA o filtraríamos por tags de Cloudinary
    setTimeout(() => {
      setForm((prev) => {
        const nextImages = [...prev.images, url].slice(0, 5);
        return { ...prev, images: nextImages };
      });
      setUploadingImages(false);
    }, 800); // Pequeño delay para feedback de "escaneado"
  }, []);

  const removeImage = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

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
    <Card className="p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-tight" style={{ fontFamily: "'Gajraj One', cursive" }}>
        Nutra<span className="text-pink-accent">Core</span> Lab
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <input
              id="title"
              ref={titleRef}
              defaultValue={form.title}
              onChange={(event) => {
                const val = event.target.value;
                setForm((prev) => ({ ...prev, title: val }));
              }}
              placeholder="EJ: BOWL ENERGÉTICO DE QUINOA"
              className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-bold uppercase outline-none focus:border-pink-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="uppercase font-bold text-xs tracking-widest">Descripción</Label>
            <textarea
              id="description"
              value={localDescription}
              onChange={(event) => {
                const val = event.target.value;
                setLocalDescription(val);
                setForm((prev) => ({ ...prev, description: val }));
              }}
              placeholder="DESCRIBE TU CREACIÓN..."
              className="min-h-24 w-full border-2 border-gray-900 rounded-none p-3 text-sm outline-none focus:border-pink-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="uppercase font-bold text-xs tracking-widest">Categoría</Label>
            <CustomSelect
              value={form.category}
              onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
              options={categories}
              placeholder="Seleccionar..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="uppercase font-bold text-xs tracking-widest">Dificultad</Label>
            <CustomSelect
              value={form.difficulty}
              onChange={(val) => setForm((prev) => ({ ...prev, difficulty: val }))}
              options={difficulties}
              placeholder="Seleccionar..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prepTime" className="uppercase font-bold text-xs tracking-widest">Tiempo (MIN)</Label>
            <input
              id="prepTime"
              type="number"
              min="1"
              value={form.prepTime}
              onChange={(event) => setForm((prev) => ({ ...prev, prepTime: event.target.value }))}
              className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-bold outline-none focus:border-pink-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="uppercase font-bold text-xs tracking-widest">Tags</Label>
            <input
              id="tags"
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="ALTA PROTEÍNA, RÁPIDO..."
              className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-bold uppercase outline-none focus:border-pink-accent transition-colors"
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
                <input
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
                  placeholder={`INGREDIENTE ${index + 1}`}
                  className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-bold uppercase outline-none focus:border-pink-accent transition-colors"
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
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientPortions[index]?.quantity ?? defaultIngredientPortion.quantity}
                  onChange={(event) => updateIngredientPortion(index, 'quantity', event.target.value)}
                  placeholder="CANT"
                  className="h-10 w-full border-2 border-gray-900 rounded-none px-3 text-sm font-bold outline-none focus:border-pink-accent transition-colors"
                />
              </div>

              <div className="space-y-1">
                <CustomSelect
                  value={ingredientPortions[index]?.unit ?? defaultIngredientPortion.unit}
                  onChange={(val) => updateIngredientPortion(index, 'unit', val)}
                  options={ingredientUnits}
                  placeholder="UNIDAD"
                />
              </div>

              <Button type="button" variant="outline" className="h-10 border-2 border-gray-900 rounded-none hover:bg-red-500 hover:text-white" onClick={() => removeArrayItem('ingredients', index)}>
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
                placeholder={`PASO ${index + 1}: EXPLICA EL PROCESO...`}
                className="min-h-20 flex-1 border-2 border-gray-900 rounded-none p-3 text-sm outline-none focus:border-pink-accent transition-colors"
              />
              <Button type="button" variant="outline" className="self-start border-2 border-gray-900 rounded-none h-10 hover:bg-red-500 hover:text-white" onClick={() => removeArrayItem('steps', index)}>
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

        <div className="space-y-4">
          <Label>Imágenes de la receta (máximo 5)</Label>
          <CloudinaryUploadWidget 
            onUploadSuccess={handleImageUploadSuccess}
            multiple={true}
            folder="nutracore/recipes"
          >
            <div className="flex items-center justify-center gap-2 border-2 border-dashed border-pink-accent/40 rounded-none p-4 cursor-pointer hover:bg-pink-50/40 transition-colors">
              <Upload className="w-4 h-4 text-pink-accent" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Añade aquí tus imagenes</span>
            </div>
          </CloudinaryUploadWidget>

          {uploadingImages && (
            <div className="flex items-center gap-3 p-3 bg-pink-50 border-2 border-pink-accent animate-pulse">
              <div className="w-2 h-2 bg-pink-accent rounded-full"></div>
              <p className="text-xs font-bold text-pink-accent uppercase tracking-widest">Analizando plato con IA NutraCore...</p>
            </div>
          )}

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
          className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white h-12 rounded-none border-b-4 border-r-4 border-pink-900/30 transition-all hover:translate-y-[-2px] active:translate-y-[2px]"
          disabled={isSubmitting || uploadingImages}
        >
          <span className="font-bold tracking-wider">{isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR RECETA'}</span>
        </Button>
      </form>
    </Card>
  );
}

