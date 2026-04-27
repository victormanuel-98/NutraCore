import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Heart, Clock, Flame, ChefHat, SlidersHorizontal, ImageOff } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getRecipes, toggleFavorite } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { StarRating } from "./ui/StarRating";
import { RecipeDetail } from "./recipes/RecipeDetail";
import { useNotification } from "../context/NotificationContext";

const categoryLabels = {
  desayuno: "Desayuno",
  "almuerzo/cena": "Almuerzo/Cena",
  merienda: "Merienda",
  snack: "Snack",
  "post-entreno": "Post-entreno",
  "cena ligera": "Cena ligera"
};

const getDifficultyLabel = (difficulty) => {
  const normalized = String(difficulty || "").toLowerCase();
  if (normalized === "media") return "Media";
  if (["facil", "f\u00e1cil", "fÃ¡cil"].includes(normalized)) return "Facil";
  if (["dificil", "dif\u00edcil", "difÃ­cil"].includes(normalized)) return "Dificil";
  return difficulty || "Sin nivel";
};

const mapApiRecipe = (recipe) => ({
  id: recipe._id,
  title: recipe.title,
  image: recipe.images?.[0] || null,
  calories: recipe.nutrition?.calories || 0,
  protein: recipe.nutrition?.protein || 0,
  carbs: recipe.nutrition?.carbs || 0,
  fats: recipe.nutrition?.fats || 0,
  prepTime: recipe.prepTime || 0,
  difficulty: recipe.difficulty,
  category: recipe.category,
  tags: recipe.tags || [],
  source: "api",
  favoritesCount: recipe.favoritesCount || 0,
  favoritedBy: recipe.favoritedBy || [],
  averageRating: recipe.averageRating || 0,
  reviewsCount: recipe.reviewsCount || 0,
  ingredients: recipe.ingredients || [],
  steps: recipe.steps || []
});

function CatalogImage({ src, alt }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(src);

  const optimizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return src;
    if (src.includes('cloudinary.com')) {
      // Aplicar transformaciones automaticas y redimension para el catalogo
      return src.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_scale/');
    }
    return src;
  }, [src]);

  if (!hasImage || imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-500">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff className="h-8 w-8 pixel-icon" aria-hidden="true" />
          <span className="font-medium text-sm">Imagen no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}

export function Catalog() {
  const { token, isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [apiRecipes, setApiRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getRecipes({ limit: 100 }, token || undefined);
        const mapped = (response.data || []).map(mapApiRecipe);
        setApiRecipes(mapped);
      } catch (err) {
        setError(err.message || "No se pudo cargar el catalogo desde la API");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [token]);

  const allRecipes = useMemo(() => apiRecipes, [apiRecipes]);

  const categories = useMemo(() => {
    const generated = new Set(allRecipes.map((recipe) => recipe.category));
    return ["all", ...generated];
  }, [allRecipes]);

  const difficulties = useMemo(() => {
    const generated = new Set(allRecipes.map((recipe) => recipe.difficulty).filter(Boolean));
    return ["all", ...generated];
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allRecipes, searchTerm, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
  };

  const handleToggleFavorite = async (recipe) => {
    if (!isAuthenticated || !token) {
      showNotification("Debes iniciar sesion para guardar favoritos.", "info");
      return;
    }

    try {
      const response = await toggleFavorite(recipe.id, token);
      const isFavorite = response.data?.isFavorite;

      setApiRecipes((prev) =>
        prev.map((item) =>
          item.id === recipe.id
            ? {
                ...item,
                favoritesCount: response.data?.favoritesCount ?? item.favoritesCount,
                favoritedBy: isFavorite
                  ? Array.from(
                      new Set([...(item.favoritedBy || []).map((entry) => String(entry)), String(user?._id)])
                    ).filter(Boolean)
                  : (item.favoritedBy || []).filter((entry) => String(entry) !== String(user?._id))
              }
            : item
        )
      );
      showNotification(
        isFavorite ? "Receta anadida a favoritos" : "Receta eliminada de favoritos", 
        "success"
      );
    } catch (err) {
      showNotification(err.message || "Error al actualizar favorito", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <h1 className="text-4xl text-gray-900 mb-3">Catalogo de Recetas</h1>
            <p className="text-gray-600">Explora recetas del catalogo y publicaciones de la comunidad.</p>
          </Card>

          <Card className="p-5 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pixel-icon" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o etiqueta..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10 h-11 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-44 h-10 text-sm border-2 border-gray-900 rounded-none hover:border-pink-accent">
                    <Filter className="w-4 h-4 mr-2 pixel-icon" />
                    <span className="ml-1">{selectedCategory === "all" ? "Todos" : categoryLabels[selectedCategory] || selectedCategory}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "Todos" : categoryLabels[category] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40 h-10 text-sm border-2 border-gray-900 rounded-none hover:border-pink-accent">
                    <SlidersHorizontal className="w-4 h-4 mr-2 pixel-icon" />
                    <span className="ml-1">{selectedDifficulty === "all" ? "Todos" : getDifficultyLabel(selectedDifficulty)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty === "all" ? "Todos" : getDifficultyLabel(difficulty)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="h-10 px-3 text-sm border-2 border-gray-900 rounded-none hover:bg-pink-accent hover:text-white hover:border-pink-accent"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-700">Mostrando {filteredRecipes.length} recetas</p>
            </div>

            {loading && <p className="text-gray-500">Cargando recetas publicadas...</p>}
            {error && <p className="text-red-600">{error}</p>}
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isFavorite = (recipe.favoritedBy || []).some(
                (entry) => String(entry) === String(user?._id)
              );

              return (
                <Card
                  key={recipe.id}
                  className="overflow-hidden group h-full flex flex-col bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <CatalogImage src={recipe.image} alt={recipe.title} />
                    <button
                      onClick={() => handleToggleFavorite(recipe)}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 transition-colors border border-gray-200"
                      aria-label="Anadir o quitar favorito"
                    >
                      <Heart className={`w-5 h-5 pixel-icon ${isFavorite ? "fill-pink-accent text-pink-accent" : "text-gray-600"}`} />
                    </button>
                    <Badge className="absolute top-4 left-4 bg-white text-pink-accent border border-pink-accent/30 hover:bg-white">
                      {categoryLabels[recipe.category] || recipe.category}
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="min-h-[5.5rem]">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 min-h-[3.5rem]">{recipe.title}</h3>

                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={recipe.averageRating} size={16} />
                        <span className="text-xs text-gray-400 font-medium">
                          ({recipe.reviewsCount})
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 min-h-[1.5rem]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 pixel-icon" />
                          <span>{recipe.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500 pixel-icon" />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4 pixel-icon" />
                          <span>{getDifficultyLabel(recipe.difficulty)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-3 bg-gray-50 min-h-[84px] border border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Proteina</p>
                        <p className="font-bold text-gray-900">{recipe.protein}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Carbs</p>
                        <p className="font-bold text-gray-900">{recipe.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grasas</p>
                        <p className="font-bold text-gray-900">{recipe.fats}g</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[56px] content-start">
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={`${recipe.id}-tag-${index}`} className="text-xs bg-pink-50 text-pink-accent border border-pink-accent/25 hover:bg-pink-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white mt-auto rounded-none"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      Ver Receta
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedRecipe && (
            <RecipeDetail 
              recipe={selectedRecipe} 
              onClose={() => setSelectedRecipe(null)} 
            />
          ) /* Modal de Detalle */}

          {filteredRecipes.length === 0 && !loading && (
            <Card className="text-center py-16 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                <Search className="w-12 h-12 text-gray-400 pixel-icon" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron recetas</h3>
              <p className="text-gray-600 mb-6">Intenta con otros terminos de busqueda o ajusta los filtros.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

