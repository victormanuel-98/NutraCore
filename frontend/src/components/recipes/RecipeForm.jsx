import { useMemo, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { filesToBase64 } from '../../utils/imageToBase64';

const categories = ['desayuno', 'almuerzo/cena', 'merienda', 'snack', 'post-entreno', 'cena ligera'];
const difficulties = ['fácil', 'media', 'difícil'];

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

const normalizeForSubmit = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  ingredients: form.ingredients.map((item) => item.trim()).filter(Boolean),
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

  const imagePreviews = useMemo(() => form.images.slice(0, 5), [form.images]);

  const updateArrayItem = (field, index, value) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addArrayItem = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => {
      if (prev[field].length === 1) return prev;
      const next = prev[field].filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, [field]: next };
    });
  };

  const updateNutrition = (field, value) => {
    setForm((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;

    setFormError('');
    setUploadingImages(true);

    try {
      const base64Images = await filesToBase64(files, 5);
      setForm((prev) => ({ ...prev, images: base64Images }));
    } catch (error) {
      setFormError(error.message || 'No se pudieron procesar las imágenes');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const payload = normalizeForSubmit(form);

    if (!payload.title || !payload.description) {
      setFormError('Debes completar título y descripción');
      return;
    }

    if (payload.ingredients.length === 0 || payload.steps.length === 0) {
      setFormError('Debes añadir al menos un ingrediente y un paso');
      return;
    }

    if (!payload.prepTime || payload.prepTime < 1) {
      setFormError('El tiempo de preparación debe ser mayor que 0');
      return;
    }

    try {
      await onSubmit(payload);
      setForm(initialForm);
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

          {form.ingredients.map((item, index) => (
            <div key={`ingredient-${index}`} className="flex gap-2">
              <Input
                value={item}
                onChange={(event) => updateArrayItem('ingredients', index, event.target.value)}
                placeholder={`Ingrediente ${index + 1}`}
              />
              <Button type="button" variant="outline" onClick={() => removeArrayItem('ingredients', index)}>
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
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorías</Label>
              <Input id="calories" type="number" min="0" value={form.nutrition.calories} onChange={(event) => updateNutrition('calories', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input id="protein" type="number" min="0" value={form.nutrition.protein} onChange={(event) => updateNutrition('protein', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" type="number" min="0" value={form.nutrition.carbs} onChange={(event) => updateNutrition('carbs', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Grasas (g)</Label>
              <Input id="fats" type="number" min="0" value={form.nutrition.fats} onChange={(event) => updateNutrition('fats', event.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="images">Imágenes (máximo 5)</Label>
          <label htmlFor="images" className="flex items-center justify-center gap-2 border border-dashed border-pink-accent/40 rounded-md p-4 cursor-pointer hover:bg-pink-50/40 transition-colors">
            <Upload className="w-4 h-4 text-pink-accent" />
            <span className="text-sm text-gray-700">{uploadingImages ? 'Procesando imágenes...' : 'Seleccionar imágenes'}</span>
          </label>
          <input id="images" type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} disabled={uploadingImages} />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {imagePreviews.map((image, index) => (
                <img key={`preview-${index}`} src={image} alt={`preview-${index}`} className="h-24 w-full rounded-md object-cover border border-gray-200" />
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
