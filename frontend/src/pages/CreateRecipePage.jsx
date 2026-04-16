import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RecipeForm } from '../components/recipes/RecipeForm';
import { MyRecipesList } from '../components/recipes/MyRecipesList';
import { createRecipe } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

export function CreateRecipePage() {
  const { token, isAuthenticated } = useAuth();
  const [submitState, setSubmitState] = useState({ loading: false, success: '', error: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (payload) => {
    setSubmitState({ loading: true, success: '', error: '' });

    try {
      await createRecipe(payload, token);
      setSubmitState({ loading: false, success: 'Receta publicada correctamente.', error: '' });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setSubmitState({ loading: false, success: '', error: error.message || 'No se pudo publicar la receta' });
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl text-gray-900">NutraCore Lab</h1>
          <p className="text-gray-700 text-base">Publica tus recetas para que aparezcan automáticamente en el catálogo por categoría.</p>
        </header>

        {submitState.success && <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3">{submitState.success}</p>}
        {submitState.error && <p className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{submitState.error}</p>}

        <div className="grid xl:grid-cols-2 gap-6 items-start">
          <RecipeForm onSubmit={handleSubmit} isSubmitting={submitState.loading} />
          <MyRecipesList token={token} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
