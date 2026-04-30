import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { deleteRecipe, getMyRecipes } from '../../services/recipeService';

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

  return (
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
      ) : recipes.length === 0 ? (
        <p className="text-gray-500 italic">Todavía no tienes recetas publicadas en el laboratorio.</p>
      ) : (
        <div className="space-y-6">
          {recipes.map((recipe) => (
            <div 
              key={recipe._id} 
              className="border-2 border-gray-200 p-4 transition-all hover:border-pink-accent/40 group relative"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {recipe.images?.[0] && (
                  <div className="w-full md:w-24 h-24 flex-shrink-0 border border-gray-100">
                    <img 
                      src={recipe.images[0].includes('cloudinary.com') ? recipe.images[0].replace('/upload/', '/upload/w_150,h_150,c_fill,f_auto,q_auto/') : recipe.images[0]} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{recipe.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-500 uppercase">
                        <span>{formatCategory(recipe.category)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{recipe.difficulty}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{recipe.prepTime} MIN</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
  );
}
