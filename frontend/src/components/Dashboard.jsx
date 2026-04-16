import { Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Heart,
  Activity,
  Calendar,
  ChevronRight,
  Zap,
  Award,
  BookOpen,
  Clock,
  Apple
} from "lucide-react";

export function Dashboard() {
  // Mock user data
  const userName = "Usuario";
  const dailyGoals = {
    calories: { current: 1847, target: 2200 },
    protein: { current: 98, target: 150 },
    carbs: { current: 180, target: 250 },
    fat: { current: 52, target: 73 },
  };

  const recentMeals = [
    { id: 1, name: "Tostada de aguacate", time: "08:30", calories: 320, type: "Desayuno" },
    { id: 2, name: "Bowl de quinoa", time: "13:15", calories: 450, type: "Almuerzo" },
    { id: 3, name: "Smoothie de berries", time: "16:00", calories: 180, type: "Snack" },
  ];

  const favoriteRecipes = [
    { 
      id: 1, 
      name: "Salmón a la plancha", 
      image: "/images/dashboard/favorite-1.jpg",
      calories: 420 
    },
    { 
      id: 2, 
      name: "Bowl de quinoa", 
      image: "/images/dashboard/favorite-2.jpg",
      calories: 340 
    },
  ];

  const weeklyProgress = [
    { day: "L", percentage: 95 },
    { day: "M", percentage: 88 },
    { day: "X", percentage: 102 },
    { day: "J", percentage: 78 },
    { day: "V", percentage: 91 },
    { day: "S", percentage: 85 },
    { day: "D", percentage: 84 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">`r`n      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hola, {userName} x9
            </h1>
            <p className="text-gray-600">
              Aquí está tu resumen nutricional del día
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Goals */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-accent/10 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-pink-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Objetivos Diarios</h2>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Badge>
                </div>

                {/* Calories - Main Goal */}
                <div className="mb-6 p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-6 h-6 text-pink-accent" />
                      <span className="font-medium text-gray-900">Calorías</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {dailyGoals.calories.current} / {dailyGoals.calories.target} kcal
                    </span>
                  </div>
                  <Progress 
                    value={(dailyGoals.calories.current / dailyGoals.calories.target) * 100} 
                    className="h-3 bg-pink-200"
                  />
                  <p className="text-sm text-gray-700 mt-2">
                    Te quedan {dailyGoals.calories.target - dailyGoals.calories.current} kcal para hoy
                  </p>
                </div>

                {/* Macros */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Protein */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Proteína</span>
                      <span className="text-xs text-gray-500">
                        {dailyGoals.protein.current}g / {dailyGoals.protein.target}g
                      </span>
                    </div>
                    <Progress 
                      value={(dailyGoals.protein.current / dailyGoals.protein.target) * 100}
                      className="h-2 bg-blue-200"
                    />
                  </div>

                  {/* Carbs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Carbohidratos</span>
                      <span className="text-xs text-gray-500">
                        {dailyGoals.carbs.current}g / {dailyGoals.carbs.target}g
                      </span>
                    </div>
                    <Progress 
                      value={(dailyGoals.carbs.current / dailyGoals.carbs.target) * 100}
                      className="h-2 bg-green-200"
                    />
                  </div>

                  {/* Fat */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Grasas</span>
                      <span className="text-xs text-gray-500">
                        {dailyGoals.fat.current}g / {dailyGoals.fat.target}g
                      </span>
                    </div>
                    <Progress 
                      value={(dailyGoals.fat.current / dailyGoals.fat.target) * 100}
                      className="h-2 bg-yellow-200"
                    />
                  </div>
                </div>
              </Card>

              {/* Recent Meals */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-accent/10 p-2 rounded-lg">
                      <Apple className="w-5 h-5 text-pink-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Comidas de Hoy</h2>
                  </div>
                  <Button variant="ghost" size="sm" className="text-pink-accent hover:text-pink-accent/80">
                    Ver todo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {recentMeals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{meal.name}</h4>
                          <p className="text-sm text-gray-500">{meal.type}  {meal.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{meal.calories} kcal</p>
                      </div>
                    </div>
                  ))}
                  
                  <Link to="/catalog">
                    <Button className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white mt-2">
                      Agregar Comida
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Weekly Progress */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-pink-accent/10 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-pink-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Progreso Semanal</h2>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full overflow-hidden flex flex-col-reverse" style={{ height: '100px' }}>
                        <div 
                          className={`w-full rounded-full transition-all ${
                            day.percentage >= 100
                              ? "bg-green-500"
                              : day.percentage >= 80
                                ? "bg-pink-accent"
                                : "bg-orange-500"
                          }`}
                          style={{ height: `${Math.min(day.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{day.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">≥ 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-accent rounded-full"></div>
                    <span className="text-gray-600">80-99%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">&lt; 80%</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Quick Access */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Resumen Rpido</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Racha</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">7 días</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Logros</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">12</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Favoritos</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">24</span>
                  </div>
                </div>
              </Card>

              {/* Favorite Recipes */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recetas Favoritas</h3>
                  <Link to="/catalog">
                    <Button variant="ghost" size="sm" className="text-pink-accent hover:text-pink-accent/80">
                      Ver más
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {favoriteRecipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                      <img 
                        src={recipe.image} 
                        alt={recipe.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{recipe.name}</h4>
                        <p className="text-xs text-gray-500">{recipe.calories} kcal</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Acciones Rpidas</h3>
                <div className="space-y-2">
                  <Link to="/lab">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                      <Zap className="w-4 h-4 mr-2" />
                      NutraCore Lab
                    </Button>
                  </Link>
                  
                  <Link to="/catalog">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorar Recetas
                    </Button>
                  </Link>

                  <Link to="/news">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Leer Noticias
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







