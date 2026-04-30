import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Heart, Clock, Flame, ChefHat, SlidersHorizontal } from "lucide-react";
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
import { fallbackRecipeImage } from "../utils/recipeImage";

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
  if (["facil", "fácil"].includes(normalized)) return "Fácil";
  if (["dificil", "difícil"].includes(normalized)) return "Difícil";
  return difficulty || "Sin nivel";
};

const ALLERGEN_KEYWORDS = {
  gluten: ['gluten', 'trigo', 'harina', 'pan', 'pasta', 'cebada', 'centeno'],
  lactosa: ['lactosa', 'leche', 'queso', 'yogur', 'mantequilla', 'nata'],
  huevo: ['huevo', 'clara', 'yema'],
  frutos_secos: ['frutos secos', 'almendra', 'nuez', 'avellana', 'pistacho', 'cacahuete', 'mani'],
  soja: ['soja', 'soya', 'tofu', 'edamame'],
  marisco: ['marisco', 'gamba', 'camaron', 'langostino', 'mejillon', 'ostra'],
  pescado: ['pescado', 'atun', 'salmon', 'bacalao', 'merluza', 'sardina'],
  sesamo: ['sesamo', 'tahini']
};

const ALLERGEN_ALIASES = {
  "frutos secos": "frutos_secos",
  "fruto seco": "frutos_secos",
  "frutos-secos": "frutos_secos",
  "frutos_secos": "frutos_secos",
  "nueces": "frutos_secos",
  "cacahuete": "frutos_secos",
  "cacahuetes": "frutos_secos",
  "mani": "frutos_secos",
  "sésamo": "sesamo",
  "soya": "soja",
  "camaron": "marisco",
  "camarón": "marisco",
  "atun": "pescado",
  "atún": "pescado"
};

const safeNumber = (value, fallback = null) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAllergenTerm = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ALLERGEN_ALIASES[normalized] || normalized;
};

const removeDiacritics = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const calcMacroPercents = (recipe) => {
  const proteinKcal = Number(recipe.protein || 0) * 4;
  const carbsKcal = Number(recipe.carbs || 0) * 4;
  const fatsKcal = Number(recipe.fats || 0) * 9;
  const total = proteinKcal + carbsKcal + fatsKcal;

  if (total <= 0) {
    return { proteinPct: 0, carbsPct: 0, fatsPct: 0 };
  }

  return {
    proteinPct: (proteinKcal / total) * 100,
    carbsPct: (carbsKcal / total) * 100,
    fatsPct: (fatsKcal / total) * 100
  };
};

const recipeContainsExcludedAllergen = (recipe, excludedAllergens = []) => {
  if (!Array.isArray(excludedAllergens) || excludedAllergens.length === 0) return false;

  const haystack = [
    ...(recipe.ingredients || []),
    ...(recipe.tags || []),
    recipe.title || ''
  ]
    .join(' ')
    .toLowerCase();
  const plainHaystack = removeDiacritics(haystack);

  return excludedAllergens.some((allergen) => {
    const normalized = removeDiacritics(allergen.toLowerCase());
    const terms = ALLERGEN_KEYWORDS[normalized] || [normalized];
    return terms.some((term) => plainHaystack.includes(removeDiacritics(term)));
  });
};

const mapApiRecipe = (recipe) => ({
  id: recipe._id,
  authorId: recipe.author?._id || recipe.author || null,
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
  const safeSrc = src || fallbackRecipeImage;
  const hasImage = Boolean(safeSrc);

  const optimizedSrc = useMemo(() => {
    if (!safeSrc || typeof safeSrc !== 'string') return safeSrc;
    if (safeSrc.includes('cloudinary.com')) {
      // Aplicar transformaciones automáticas y redimensión para el catálogo
      return safeSrc.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_scale/');
    }
    return safeSrc;
  }, [safeSrc]);

  if (!hasImage || imageError) {
    return <img src={fallbackRecipeImage} alt="Imagen por defecto de receta" className="w-full h-full object-cover" />;
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
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [proteinPctMin, setProteinPctMin] = useState("");
  const [proteinPctMax, setProteinPctMax] = useState("");
  const [carbsPctMin, setCarbsPctMin] = useState("");
  const [carbsPctMax, setCarbsPctMax] = useState("");
  const [fatsPctMin, setFatsPctMin] = useState("");
  const [fatsPctMax, setFatsPctMax] = useState("");
  const [excludedAllergensInput, setExcludedAllergensInput] = useState("");
  const [apiRecipes, setApiRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getRecipes(
          {
            page: currentPage,
            limit: 12,
            search: searchTerm,
            category: selectedCategory,
            difficulty: selectedDifficulty
          },
          token || undefined
        );
        const mapped = (response.data || []).map(mapApiRecipe);
        setApiRecipes(mapped);
        setTotalPages(Math.max(1, Number(response.meta?.totalPages || 1)));
        setTotalRecipes(Number(response.meta?.total || 0));
      } catch (err) {
        setError(err.message || "No se pudo cargar el catálogo desde la API");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [token, currentPage, searchTerm, selectedCategory, selectedDifficulty]);

  const categories = useMemo(() => ["all", ...Object.keys(categoryLabels)], []);
  const difficulties = useMemo(() => ["all", "fácil", "media", "difícil", "facil", "dificil"], []);

  const filteredRecipes = useMemo(() => {
    const minCals = safeNumber(minCalories);
    const maxCals = safeNumber(maxCalories);
    const pMin = safeNumber(proteinPctMin);
    const pMax = safeNumber(proteinPctMax);
    const cMin = safeNumber(carbsPctMin);
    const cMax = safeNumber(carbsPctMax);
    const fMin = safeNumber(fatsPctMin);
    const fMax = safeNumber(fatsPctMax);
    const hasMacroFilter = pMin !== null || pMax !== null || cMin !== null || cMax !== null || fMin !== null || fMax !== null;
    const hasCaloriesFilter = minCals !== null || maxCals !== null;
    const excludedAllergens = excludedAllergensInput
      .split(/[,;|]/)
      .map((value) => normalizeAllergenTerm(value))
      .filter(Boolean);

    return apiRecipes.filter((recipe) => {
      const calories = Number(recipe.calories || 0);
      const hasValidCalories = Number.isFinite(calories) && calories > 0;
      const matchesCalories =
        !hasCaloriesFilter ||
        (hasValidCalories && (minCals === null || calories >= minCals) && (maxCals === null || calories <= maxCals));

      const { proteinPct, carbsPct, fatsPct } = calcMacroPercents(recipe);
      const hasMacroData = Number(recipe.protein || 0) > 0 || Number(recipe.carbs || 0) > 0 || Number(recipe.fats || 0) > 0;
      const matchesMacroPercents =
        !hasMacroFilter ||
        (hasMacroData &&
          (pMin === null || proteinPct >= pMin) &&
          (pMax === null || proteinPct <= pMax) &&
          (cMin === null || carbsPct >= cMin) &&
          (cMax === null || carbsPct <= cMax) &&
          (fMin === null || fatsPct >= fMin) &&
          (fMax === null || fatsPct <= fMax));

      const excludedByAllergen = recipeContainsExcludedAllergen(recipe, excludedAllergens);

      return (
        matchesCalories &&
        matchesMacroPercents &&
        !excludedByAllergen
      );
    });
  }, [
    apiRecipes,
    minCalories,
    maxCalories,
    proteinPctMin,
    proteinPctMax,
    carbsPctMin,
    carbsPctMax,
    fatsPctMin,
    fatsPctMax,
    excludedAllergensInput
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setMinCalories("");
    setMaxCalories("");
    setProteinPctMin("");
    setProteinPctMax("");
    setCarbsPctMin("");
    setCarbsPctMax("");
    setFatsPctMin("");
    setFatsPctMax("");
    setExcludedAllergensInput("");
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (recipe) => {
    if (!isAuthenticated || !token) {
      showNotification("Debes iniciar sesión para guardar favoritos.", "info");
      return;
    }

    if (String(recipe.authorId) === String(user?._id)) {
      showNotification('No puedes dar me gusta ni guardar en favoritos tu propia receta.', 'info');
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
        isFavorite ? "Receta añadida a favoritos" : "Receta eliminada de favoritos",
        "success"
      );
    } catch (err) {
      showNotification(err.message || "Error al actualizar favorito", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark-pink-fields">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <h1 className="text-4xl text-gray-900 mb-3">Catálogo de Recetas</h1>
            <p className="text-gray-600">Explora recetas del catálogo y publicaciones de la comunidad.</p>
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

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Kcal min"
                  value={minCalories}
                  onChange={(event) => setMinCalories(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Kcal max"
                  value={maxCalories}
                  onChange={(event) => setMaxCalories(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Prot min"
                  value={proteinPctMin}
                  onChange={(event) => setProteinPctMin(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Prot max"
                  value={proteinPctMax}
                  onChange={(event) => setProteinPctMax(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Carb min"
                  value={carbsPctMin}
                  onChange={(event) => setCarbsPctMin(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Carb max"
                  value={carbsPctMax}
                  onChange={(event) => setCarbsPctMax(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Grasa min"
                  value={fatsPctMin}
                  onChange={(event) => setFatsPctMin(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%Grasa max"
                  value={fatsPctMax}
                  onChange={(event) => setFatsPctMax(event.target.value)}
                  className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
              </div>
            </div>

            <Input
              type="text"
              placeholder="Excluir alérgenos (coma separada): gluten, lactosa, huevo, frutos_secos, soja, marisco, pescado, sesamo"
              value={excludedAllergensInput}
              onChange={(event) => setExcludedAllergensInput(event.target.value)}
              className="h-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
            />

            <div className="flex items-center justify-between">
              <p className="text-gray-700">Mostrando {filteredRecipes.length} recetas (total: {totalRecipes})</p>
              <p className="text-sm text-gray-500">Página {currentPage} de {totalPages}</p>
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
                      disabled={String(recipe.authorId) === String(user?._id)}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 transition-colors border border-gray-200"
                      aria-label="Añadir o quitar favorito"
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
                        <p className="text-sm text-gray-600">Proteína</p>
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
              <p className="text-gray-600 mb-6">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </Card>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="catalog-pagination-btn h-10 px-4 border-2 border-gray-900 rounded-none disabled:opacity-45 disabled:cursor-not-allowed"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="catalog-pagination-btn h-10 px-4 border-2 border-gray-900 rounded-none disabled:opacity-45 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

