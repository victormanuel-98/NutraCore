import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, CalendarDays, Flame, Heart, PlusSquare, Target, TrendingUp, UserCircle2, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../services/userService';
import { getFavoriteRecipes, getMyRecipes } from '../services/recipeService';

const categoryLabels = {
  desayuno: 'Desayuno',
  'almuerzo/cena': 'Almuerzo/Cena',
  merienda: 'Merienda',
  snack: 'Snack',
  'post-entreno': 'Post-entreno',
  'cena ligera': 'Cena ligera'
};

const numberOrDefault = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);

export function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError('');

        const [statsResult, favoritesResult, recipesResult] = await Promise.allSettled([
          getUserStats(token),
          getFavoriteRecipes(token),
          getMyRecipes(token)
        ]);

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value?.data || null);
        } else {
          setStats(null);
        }

        if (favoritesResult.status === 'fulfilled') {
          setFavoriteRecipes(Array.isArray(favoritesResult.value?.data) ? favoritesResult.value.data : []);
        } else {
          setFavoriteRecipes([]);
        }

        if (recipesResult.status === 'fulfilled') {
          setMyRecipes(Array.isArray(recipesResult.value?.data) ? recipesResult.value.data : []);
        } else {
          setMyRecipes([]);
        }

        if (statsResult.status === 'rejected' && favoritesResult.status === 'rejected' && recipesResult.status === 'rejected') {
          const reason = statsResult.reason?.message || favoritesResult.reason?.message || recipesResult.reason?.message;
          setError(reason || 'No se pudo cargar el dashboard');
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const goals = user?.goals || {};
  const dailyGoals = useMemo(
    () => ({
      calories: numberOrDefault(goals.dailyCalories),
      protein: numberOrDefault(goals.protein),
      carbs: numberOrDefault(goals.carbs),
      fats: numberOrDefault(goals.fats)
    }),
    [goals]
  );

  const maxGoalValue = Math.max(dailyGoals.calories, dailyGoals.protein, dailyGoals.carbs, dailyGoals.fats, 1);
  const todayLabel = useMemo(() => formatDate(new Date()), []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                <CalendarDays className="w-4 h-4" />
                {todayLabel}
              </p>
              <h1 className="text-4xl text-gray-900">
                Hola, <span className="text-pink-accent">{user?.name || 'NutraUser'}</span>
              </h1>
              <p className="text-gray-600">Tu panel personal de progreso, recetas y objetivos diarios.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/profile">
                <Button variant="outline" className="border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent">
                  <UserCircle2 className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Link to="/lab">
                <Button className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none">
                  <PlusSquare className="w-4 h-4 mr-2" />
                  Nueva receta
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {loading && (
          <Card className="p-4 bg-white border-2 border-pink-accent rounded-none">
            <p className="text-gray-600">Cargando dashboard...</p>
          </Card>
        )}
        {error && (
          <Card className="p-4 bg-red-50 border-2 border-red-300 rounded-none">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="IMC" value={stats?.bmi ?? 'N/D'} icon={<Activity className="w-4 h-4 text-pink-accent" />} />
          <KpiCard label="Favoritos" value={stats?.totalFavorites ?? 0} icon={<Heart className="w-4 h-4 text-pink-accent" />} />
          <KpiCard label="Recetas creadas" value={stats?.totalRecipes ?? 0} icon={<BookOpen className="w-4 h-4 text-pink-accent" />} />
          <KpiCard label="Noticias guardadas" value={stats?.totalSavedNews ?? 0} icon={<TrendingUp className="w-4 h-4 text-pink-accent" />} />
        </div>

        <div className="grid xl:grid-cols-3 gap-6 items-start">
          <Card className="xl:col-span-2 p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none space-y-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-accent" />
              <h2 className="text-2xl font-bold text-gray-900">Objetivos diarios</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <GoalBar label="Calorias" value={`${dailyGoals.calories} kcal`} percent={(dailyGoals.calories / maxGoalValue) * 100} icon={<Flame className="w-4 h-4 text-pink-accent" />} />
              <GoalBar label="Proteina" value={`${dailyGoals.protein} g`} percent={(dailyGoals.protein / maxGoalValue) * 100} icon={<Activity className="w-4 h-4 text-blue-600" />} />
              <GoalBar label="Carbohidratos" value={`${dailyGoals.carbs} g`} percent={(dailyGoals.carbs / maxGoalValue) * 100} icon={<Activity className="w-4 h-4 text-green-600" />} />
              <GoalBar label="Grasas" value={`${dailyGoals.fats} g`} percent={(dailyGoals.fats / maxGoalValue) * 100} icon={<Activity className="w-4 h-4 text-yellow-600" />} />
            </div>

            <div className="border-2 border-gray-200 p-4 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 mb-2">Progreso hacia peso objetivo</p>
              <Progress value={stats?.goalProgress?.progress || 0} className="h-3" />
              <p className="text-xs text-gray-600 mt-2">
                {stats?.goalProgress
                  ? `${stats.goalProgress.progress}% | Actual: ${stats.goalProgress.current} kg | Objetivo: ${stats.goalProgress.target} kg`
                  : 'Configura tu objetivo de peso en Perfil para activar este bloque.'}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none h-[560px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900">Actividad reciente</h2>

            <div className="flex-1 min-h-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Favoritos</h3>
                  <Link to="/profile" className="text-xs text-pink-accent hover:underline">
                    Ver todos
                  </Link>
                </div>
                {favoriteRecipes.length === 0 && <p className="text-sm text-gray-500">Aun no tienes recetas favoritas.</p>}
                <div className="max-h-[185px] overflow-y-auto pr-1 space-y-2">
                  {favoriteRecipes.map((recipe) => (
                    <MiniRecipeRow key={`fav-${recipe._id}`} recipe={recipe} />
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Tus recetas</h3>
                  <Link to="/profile" className="text-xs text-pink-accent hover:underline">
                    Gestionar
                  </Link>
                </div>
                {myRecipes.length === 0 && <p className="text-sm text-gray-500">Todavia no publicaste recetas.</p>}
                <div className="max-h-[185px] overflow-y-auto pr-1 space-y-2">
                  {myRecipes.map((recipe) => (
                    <MiniRecipeRow key={`mine-${recipe._id}`} recipe={recipe} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rapidas</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link to="/lab">
              <Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                <Zap className="w-4 h-4 mr-2" />
                NutraCore Lab
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar recetas
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver noticias
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon }) {
  return (
    <Card className="p-4 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <Badge className="bg-gray-900 text-white rounded-none border-0 text-base">{value}</Badge>
    </Card>
  );
}

function GoalBar({ label, value, percent, icon }) {
  return (
    <div className="border-2 border-gray-200 p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}

function MiniRecipeRow({ recipe }) {
  return (
    <div className="border border-gray-200 p-2 bg-white">
      <p className="font-semibold text-sm text-gray-900">{recipe.title}</p>
      <p className="text-xs text-gray-500">
        {categoryLabels[recipe.category] || recipe.category || 'Sin categoria'} | {recipe.prepTime || 0} min
      </p>
    </div>
  );
}

