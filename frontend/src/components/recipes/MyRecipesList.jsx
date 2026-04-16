import { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { deleteRecipe, getMyRecipes, toggleFavorite } from '../../services/recipeService';

const formatCategory = (value = '') => {
  const text = String(value).trim();
  if (!text) return 'Sin categoría';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function MyRecipesList({ token, refreshKey = 0 }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar esta receta?');
    if (!shouldDelete) return;

    try {
      await deleteRecipe(id, token);
      setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    } catch (err) {
      alert(err.message || 'No se pudo eliminar la receta');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const response = await toggleFavorite(id, token);
      const { isFavorite, favoritesCount } = response.data;
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe._id === id
            ? {
                ...recipe,
                favoritesCount,
                favoritedBy: isFavorite ? [...(recipe.favoritedBy || []), 'me'] : (recipe.favoritedBy || []).filter((entry) => entry !== 'me')
              }
            : recipe
        )
      );
    } catch (err) {
      alert(err.message || 'No se pudo actualizar favorito');
    }
  };

  return (
    <Card className="p-6 bg-white border border-pink-accent/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Mis recetas publicadas</h2>
        <Button variant="outline" onClick={loadRecipes}>Actualizar</Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando recetas...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-gray-600">Todavía no tienes recetas publicadas.</p>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatCategory(recipe.category)} · {recipe.difficulty} · {recipe.prepTime} min</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => handleToggleFavorite(recipe._id)}>
                    <Heart className="w-4 h-4 mr-2" />
                    {recipe.favoritesCount || 0}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleDelete(recipe._id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mt-3">{recipe.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
