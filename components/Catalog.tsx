import { useState } from "react";
import { Navbar } from "./Navbar";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  Flame,
  ChefHat,
  SlidersHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Mock data de recetas
const recipes = [
  {
    id: 1,
    name: "Salmón a la plancha con vegetales",
    image: "https://images.unsplash.com/photo-1766232563961-323612b37a6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxtb24lMjBmaXNoJTIwaGVhbHRoeSUyMHByb3RlaW4lMjBtZWFsfGVufDF8fHx8MTc3NjI1MjMwOXww&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 420,
    protein: 38,
    carbs: 12,
    fat: 24,
    time: 25,
    difficulty: "Media",
    category: "Almuerzo/Cena",
    tags: ["Alto en proteína", "Omega-3", "Sin gluten"],
    isFavorite: false,
  },
  {
    id: 2,
    name: "Bowl de quinoa y vegetales",
    image: "https://images.unsplash.com/photo-1729769218931-435e9a261149?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWlub2ElMjBzYWxhZCUyMGJvd2wlMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3NjI1MjMwOXww&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 340,
    protein: 12,
    carbs: 48,
    fat: 10,
    time: 30,
    difficulty: "Fácil",
    category: "Almuerzo/Cena",
    tags: ["Vegetariano", "Alto en fibra", "Sin gluten"],
    isFavorite: true,
  },
  {
    id: 3,
    name: "Pechuga de pollo a la parrilla",
    image: "https://images.unsplash.com/photo-1762631934518-f75e233413ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnJlYXN0JTIwZ3JpbGxlZCUyMHByb3RlaW58ZW58MXx8fHwxNzc2MjUyMzEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 280,
    protein: 42,
    carbs: 8,
    fat: 8,
    time: 20,
    difficulty: "Fácil",
    category: "Almuerzo/Cena",
    tags: ["Alto en proteína", "Bajo en grasa", "Sin gluten"],
    isFavorite: false,
  },
  {
    id: 4,
    name: "Tostada de aguacate",
    image: "https://images.unsplash.com/photo-1561517146-dfbd99b0c14d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdm9jYWRvJTIwdG9hc3QlMjBicmVha2Zhc3QlMjBoZWFsdGh5fGVufDF8fHx8MTc3NjIzMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 320,
    protein: 12,
    carbs: 32,
    fat: 18,
    time: 10,
    difficulty: "Fácil",
    category: "Desayuno",
    tags: ["Vegetariano", "Grasas saludables", "Rápido"],
    isFavorite: true,
  },
  {
    id: 5,
    name: "Bowl de smoothie con berries",
    image: "https://images.unsplash.com/photo-1610450620997-6921021865da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGJvd2wlMjBiZXJyaWVzJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc3NjI1MjMxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 290,
    protein: 8,
    carbs: 52,
    fat: 6,
    time: 15,
    difficulty: "Fácil",
    category: "Desayuno",
    tags: ["Vegetariano", "Antioxidantes", "Energético"],
    isFavorite: false,
  },
  {
    id: 6,
    name: "Pasta mediterránea",
    image: "https://images.unsplash.com/photo-1759283100861-b967347ea7ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMG1lZGl0ZXJyYW5lYW4lMjBkaWV0JTIwaGVhbHRoeXxlbnwxfHx8fDE3NzYyNTIzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    calories: 450,
    protein: 16,
    carbs: 68,
    fat: 14,
    time: 35,
    difficulty: "Media",
    category: "Almuerzo/Cena",
    tags: ["Mediterránea", "Alto en carbohidratos", "Vegetariano"],
    isFavorite: false,
  },
];

export function Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set([2, 4]));

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Catálogo de Recetas
            </h1>
            <p className="text-lg text-gray-600">
              Explora más de 500 recetas saludables con información nutricional completa
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o etiqueta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Desayuno">Desayuno</SelectItem>
                  <SelectItem value="Almuerzo/Cena">Almuerzo/Cena</SelectItem>
                  <SelectItem value="Merienda">Merienda</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full lg:w-48 h-12">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Mostrando {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button 
                    onClick={() => toggleFavorite(recipe.id)}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.has(recipe.id) ? 'fill-pink-accent text-pink-accent' : 'text-gray-600'}`} 
                    />
                  </button>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 hover:bg-white">
                    {recipe.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {recipe.name}
                    </h3>
                    
                    {/* Info Row */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{recipe.calories} kcal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-4 h-4" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-2 text-center py-3 bg-gray-50 rounded-lg">
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
                      <p className="font-bold text-gray-900">{recipe.fat}g</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white">
                    Ver Receta
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredRecipes.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No se encontraron recetas
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="bg-pink-accent hover:bg-pink-accent/90 text-white"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
