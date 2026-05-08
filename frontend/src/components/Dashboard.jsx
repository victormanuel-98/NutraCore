import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, CalendarDays, Flame, Heart, PlusSquare, Target, TrendingUp, UserCircle2, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../context/AuthContext';
import { getMenuConsumptionState, getUserProfile, getUserStats, saveMenuConsumptionState } from '../services/userService';
import { getFavoriteRecipes, getMyRecipes } from '../services/recipeService';

const NUTRIENT_KEYS = ['calories', 'protein', 'carbs', 'fats'];
const MENU_SLOTS_BY_PERIOD = { daily: 4, weekly: 10, monthly: 20 };

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

const getPeriodElapsedPercent = (period) => {
  const now = new Date();
  if (period === 'daily') {
    const minutes = now.getHours() * 60 + now.getMinutes();
    return Math.max(1, Math.min(100, Math.round((minutes / 1440) * 100)));
  }
  if (period === 'weekly') {
    const day = now.getDay();
    const normalized = day === 0 ? 7 : day;
    return Math.max(1, Math.min(100, Math.round((normalized / 7) * 100)));
  }
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.max(1, Math.min(100, Math.round((dayOfMonth / daysInMonth) * 100)));
};

const getRecipeNutrition = (recipe) => {
  const nutrition = recipe?.nutrition || {};
  return {
    calories: numberOrDefault(nutrition.calories ?? recipe?.calories),
    protein: numberOrDefault(nutrition.protein ?? recipe?.protein),
    carbs: numberOrDefault(nutrition.carbs ?? recipe?.carbs),
    fats: numberOrDefault(nutrition.fats ?? recipe?.fats)
  };
};

const getPeriodBucketKey = (period, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (period === 'daily') return `${year}-${month}-${day}`;
  if (period === 'monthly') return `${year}-${month}`;
  const monday = new Date(date);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - (weekday - 1));
  const mondayYear = monday.getFullYear();
  const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const mondayDay = String(monday.getDate()).padStart(2, '0');
  return `${mondayYear}-W-${mondayMonth}-${mondayDay}`;
};

const normalizePersistedMenuState = (rawPlanner = {}, rawConsumed = {}) => {
  const periods = ['daily', 'weekly', 'monthly'];
  const normalizedPlanner = { daily: {}, weekly: {}, monthly: {} };
  const normalizedConsumed = { daily: {}, weekly: {}, monthly: {} };

  periods.forEach((period) => {
    const plannerValue = rawPlanner?.[period];
    if (plannerValue && typeof plannerValue === 'object' && !Array.isArray(plannerValue)) {
      normalizedPlanner[period] = Object.fromEntries(
        Object.entries(plannerValue).map(([bucket, value]) => [bucket, Number(value) || 0])
      );
    } else if (plannerValue !== undefined) {
      normalizedPlanner[period][getPeriodBucketKey(period)] = Number(plannerValue) || 0;
    }

    const consumedValue = rawConsumed?.[period];
    if (consumedValue && typeof consumedValue === 'object' && !Array.isArray(consumedValue)) {
      const hasDirectRecipeMap = Object.values(consumedValue).some((v) => typeof v === 'boolean');
      if (hasDirectRecipeMap) {
        normalizedConsumed[period][getPeriodBucketKey(period)] = Object.fromEntries(
          Object.entries(consumedValue).map(([k, v]) => [k, Boolean(v)])
        );
      } else {
        const buckets = {};
        Object.entries(consumedValue).forEach(([bucket, recipeMap]) => {
          if (!recipeMap || typeof recipeMap !== 'object' || Array.isArray(recipeMap)) return;
          buckets[bucket] = Object.fromEntries(
            Object.entries(recipeMap).map(([k, v]) => [k, Boolean(v)])
          );
        });
        normalizedConsumed[period] = buckets;
      }
    }
  });

  return { normalizedPlanner, normalizedConsumed };
};

export function Dashboard() {
  const { token, user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [goalPeriod, setGoalPeriod] = useState('daily');
  const [plannerVersionByPeriod, setPlannerVersionByPeriod] = useState({ daily: {}, weekly: {}, monthly: {} });
  const [consumedByPeriod, setConsumedByPeriod] = useState({ daily: {}, weekly: {}, monthly: {} });
  const [menuStateHydrated, setMenuStateHydrated] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) {
        setLoading(false);
        setStats(null);
        setFavoriteRecipes([]);
        setMyRecipes([]);
        setProfileUser(null);
        setPlannerVersionByPeriod({ daily: {}, weekly: {}, monthly: {} });
        setConsumedByPeriod({ daily: {}, weekly: {}, monthly: {} });
        setMenuStateHydrated(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [statsResult, favoritesResult, recipesResult, profileResult, menuStateResult] = await Promise.allSettled([
          getUserStats(token),
          getFavoriteRecipes(token),
          getMyRecipes(token),
          getUserProfile(token),
          getMenuConsumptionState(token)
        ]);

        const nextFavorites = favoritesResult.status === 'fulfilled' && Array.isArray(favoritesResult.value?.data)
          ? favoritesResult.value.data
          : [];
        const nextMyRecipes = recipesResult.status === 'fulfilled' && Array.isArray(recipesResult.value?.data)
          ? recipesResult.value.data
          : [];
        const nextProfile = profileResult.status === 'fulfilled' ? profileResult.value?.data || null : null;

        setFavoriteRecipes(nextFavorites);
        setMyRecipes(nextMyRecipes);
        setProfileUser(nextProfile);
        if (menuStateResult.status === 'fulfilled') {
          const menuData = menuStateResult.value?.data || {};
          const { normalizedPlanner, normalizedConsumed } = normalizePersistedMenuState(
            menuData.plannerVersionByPeriod,
            menuData.consumedByPeriod
          );
          setPlannerVersionByPeriod(normalizedPlanner);
          setConsumedByPeriod(normalizedConsumed);
        }
        setMenuStateHydrated(true);

        const fallbackStats = {
          totalFavorites: nextFavorites.length,
          totalRecipes: nextMyRecipes.length,
          totalSavedNews: Array.isArray(nextProfile?.savedNews) ? nextProfile.savedNews.length : 0,
          bmi: nextProfile?.bmi ?? null,
          goalProgress: null
        };

        setStats(statsResult.status === 'fulfilled' ? statsResult.value?.data || fallbackStats : fallbackStats);

        if (statsResult.status !== 'fulfilled' && profileResult.status === 'fulfilled') {
          const current = Number(nextProfile?.weight);
          const target = Number(nextProfile?.goals?.targetWeight);
          if (Number.isFinite(current) && Number.isFinite(target) && current > 0 && target > 0) {
            const difference = Math.abs(current - target);
            const progress = difference === 0 ? 100 : Math.max(0, Math.min(100, 100 - (difference / current) * 100));
            setStats((prev) => ({
              ...(prev || fallbackStats),
              goalProgress: {
                current,
                target,
                difference,
                progress: Math.round(progress)
              }
            }));
          }
        }

        if (
          statsResult.status === 'rejected' &&
          favoritesResult.status === 'rejected' &&
          recipesResult.status === 'rejected' &&
          profileResult.status === 'rejected'
        ) {
          const reason =
            statsResult.reason?.message ||
            favoritesResult.reason?.message ||
            recipesResult.reason?.message ||
            profileResult.reason?.message;
          setError(reason || 'No se pudo cargar el dashboard');
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, refreshTick]);

  useEffect(() => {
    if (!token || !menuStateHydrated) return;
    const persist = async () => {
      try {
        await saveMenuConsumptionState(
          { plannerVersionByPeriod, consumedByPeriod },
          token
        );
      } catch {
        // Persistencia best-effort para no bloquear UX del dashboard.
      }
    };
    persist();
  }, [consumedByPeriod, menuStateHydrated, plannerVersionByPeriod, token]);

  const goals = profileUser?.goals || user?.goals || {};
  const dailyGoals = useMemo(
    () => ({
      calories: numberOrDefault(goals.dailyCalories),
      protein: numberOrDefault(goals.protein),
      carbs: numberOrDefault(goals.carbs),
      fats: numberOrDefault(goals.fats)
    }),
    [goals]
  );

  const periodMultipliers = { daily: 1, weekly: 7, monthly: 30 };
  const currentMultiplier = periodMultipliers[goalPeriod] || 1;
  const periodTitle = goalPeriod === 'weekly' ? 'semanales' : goalPeriod === 'monthly' ? 'mensuales' : 'diarios';
  const periodElapsedPercent = useMemo(() => getPeriodElapsedPercent(goalPeriod), [goalPeriod]);
  const currentBucketKey = useMemo(() => getPeriodBucketKey(goalPeriod), [goalPeriod]);

  const recommendedPeriodGoals = useMemo(
    () => ({
      calories: numberOrDefault(dailyGoals.calories) * currentMultiplier,
      protein: numberOrDefault(dailyGoals.protein) * currentMultiplier,
      carbs: numberOrDefault(dailyGoals.carbs) * currentMultiplier,
      fats: numberOrDefault(dailyGoals.fats) * currentMultiplier
    }),
    [currentMultiplier, dailyGoals]
  );

  const periodGoals = useMemo(() => {
    const weeklyCustom = {
      calories: numberOrDefault(goals?.weeklyCalories),
      protein: numberOrDefault(goals?.weeklyProtein),
      carbs: numberOrDefault(goals?.weeklyCarbs),
      fats: numberOrDefault(goals?.weeklyFats)
    };
    const monthlyCustom = {
      calories: numberOrDefault(goals?.monthlyCalories),
      protein: numberOrDefault(goals?.monthlyProtein),
      carbs: numberOrDefault(goals?.monthlyCarbs),
      fats: numberOrDefault(goals?.monthlyFats)
    };

    const customByPeriod = { daily: {}, weekly: weeklyCustom, monthly: monthlyCustom };

    return NUTRIENT_KEYS.reduce((acc, nutrient) => {
      const recommendedCap = numberOrDefault(recommendedPeriodGoals[nutrient]);
      const customTarget = numberOrDefault(customByPeriod[goalPeriod]?.[nutrient]);
      const desiredTarget = goalPeriod === 'daily'
        ? numberOrDefault(dailyGoals[nutrient])
        : (customTarget > 0 ? customTarget : recommendedCap);

      acc[nutrient] = recommendedCap > 0 ? Math.min(desiredTarget, recommendedCap) : desiredTarget;
      return acc;
    }, {});
  }, [dailyGoals, goalPeriod, goals, recommendedPeriodGoals]);

  const candidateRecipes = useMemo(() => {
    const byId = new Map();
    [...myRecipes, ...favoriteRecipes].forEach((recipe) => {
      const id = recipe?._id || recipe?.id;
      if (!id || byId.has(id)) return;
      const nutrients = getRecipeNutrition(recipe);
      const hasNutrition = NUTRIENT_KEYS.some((key) => numberOrDefault(nutrients[key]) > 0);
      if (!hasNutrition) return;
      byId.set(id, { ...recipe, _id: id, nutrients });
    });
    return Array.from(byId.values());
  }, [favoriteRecipes, myRecipes]);

  const autoMenuRecipes = useMemo(() => {
    if (candidateRecipes.length === 0) return [];

    const slots = MENU_SLOTS_BY_PERIOD[goalPeriod] || 4;
    const sorted = [...candidateRecipes].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    const seed = plannerVersionByPeriod?.[goalPeriod]?.[currentBucketKey] || 0;
    const offset = sorted.length > 0 ? seed % sorted.length : 0;
    const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];

    const selected = [];
    const used = new Set();
    const remaining = { ...periodGoals };

    for (let i = 0; i < slots; i += 1) {
      let bestRecipe = null;
      let bestScore = -1;

      rotated.forEach((recipe) => {
        if (used.has(recipe._id)) return;
        const score = NUTRIENT_KEYS.reduce((acc, nutrient) => {
          const remain = Math.max(0, numberOrDefault(remaining[nutrient]));
          if (remain <= 0) return acc;
          const gain = Math.min(remain, numberOrDefault(recipe.nutrients[nutrient]));
          return acc + gain / remain;
        }, 0);

        if (score > bestScore) {
          bestScore = score;
          bestRecipe = recipe;
        }
      });

      if (!bestRecipe) break;
      used.add(bestRecipe._id);
      selected.push(bestRecipe);

      NUTRIENT_KEYS.forEach((nutrient) => {
        remaining[nutrient] = Math.max(0, numberOrDefault(remaining[nutrient]) - numberOrDefault(bestRecipe.nutrients[nutrient]));
      });
    }

    return selected.length > 0 ? selected : rotated.slice(0, slots);
  }, [candidateRecipes, currentBucketKey, goalPeriod, periodGoals, plannerVersionByPeriod]);

  const consumedMap = consumedByPeriod?.[goalPeriod]?.[currentBucketKey] || {};
  const consumedTotals = useMemo(
    () => autoMenuRecipes.reduce(
      (acc, recipe) => {
        if (!consumedMap[recipe._id]) return acc;
        NUTRIENT_KEYS.forEach((nutrient) => {
          acc[nutrient] += numberOrDefault(recipe.nutrients[nutrient]);
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    ),
    [autoMenuRecipes, consumedMap]
  );

  const chartPercents = useMemo(() => {
    return NUTRIENT_KEYS.reduce((acc, nutrient) => {
      const goalValue = numberOrDefault(periodGoals[nutrient]);
      const consumedValue = numberOrDefault(consumedTotals[nutrient]);
      acc[nutrient] = goalValue > 0 ? Math.max(0, Math.min(100, Math.round((consumedValue / goalValue) * 100))) : 0;
      return acc;
    }, {});
  }, [consumedTotals, periodGoals]);

  const hasNutritionGoals = dailyGoals.calories > 0 || dailyGoals.protein > 0 || dailyGoals.carbs > 0 || dailyGoals.fats > 0;
  const hasWeightGoal = Number.isFinite(Number(goals?.targetWeight)) && Number(goals?.targetWeight) > 0;
  const engagementChecklist = useMemo(() => {
    const items = [
      { id: 'profile', label: 'Configura tus objetivos de perfil', done: hasNutritionGoals && hasWeightGoal, to: '/profile', cta: 'Completar perfil' },
      { id: 'recipe', label: 'Crea tu primera receta', done: myRecipes.length > 0, to: '/lab', cta: 'Crear receta' },
      { id: 'favorite', label: 'Guarda una receta favorita', done: favoriteRecipes.length > 0, to: '/catalog', cta: 'Explorar catalogo' },
      { id: 'news', label: 'Guarda una noticia nutricional', done: numberOrDefault(stats?.totalSavedNews) > 0, to: '/news', cta: 'Ver noticias' }
    ];
    const completed = items.filter((item) => item.done).length;
    const nextItem = items.find((item) => !item.done) || null;
    return { items, completed, total: items.length, nextItem };
  }, [favoriteRecipes.length, hasNutritionGoals, hasWeightGoal, myRecipes.length, stats?.totalSavedNews]);

  const activationPercent = Math.round((engagementChecklist.completed / engagementChecklist.total) * 100);
  const todayLabel = useMemo(() => formatDate(new Date()), []);

  const toggleConsumedRecipe = (recipeId) => {
    setConsumedByPeriod((prev) => {
      const periodState = { ...(prev[goalPeriod] || {}) };
      const bucketState = { ...(periodState[currentBucketKey] || {}) };
      bucketState[recipeId] = !bucketState[recipeId];
      periodState[currentBucketKey] = bucketState;
      return { ...prev, [goalPeriod]: periodState };
    });
  };

  const regenerateAutoMenu = () => {
    setPlannerVersionByPeriod((prev) => {
      const periodState = { ...(prev[goalPeriod] || {}) };
      periodState[currentBucketKey] = (periodState[currentBucketKey] || 0) + 1;
      return { ...prev, [goalPeriod]: periodState };
    });
    setConsumedByPeriod((prev) => {
      const periodState = { ...(prev[goalPeriod] || {}) };
      periodState[currentBucketKey] = {};
      return { ...prev, [goalPeriod]: periodState };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 dark-pink-fields">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                <CalendarDays className="w-4 h-4" />
                {todayLabel}
              </p>
              <h1 className="text-4xl text-gray-900">
                Hola, <span className="text-pink-accent">{profileUser?.name || user?.name || 'NutraUser'}</span>
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

        {loading && <Card className="p-4 bg-white border-2 border-pink-accent rounded-none"><p className="text-gray-600">Cargando dashboard...</p></Card>}
        {error && (
          <Card className="p-4 bg-red-50 border-2 border-red-300 rounded-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-red-700">{error}</p>
              <Button variant="outline" className="border-2 border-red-700 text-red-700 rounded-none hover:bg-red-100" onClick={() => setRefreshTick((prev) => prev + 1)}>
                Reintentar
              </Button>
            </div>
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
              <h2 className="text-2xl font-bold text-gray-900">Objetivos {periodTitle}</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={goalPeriod} onValueChange={setGoalPeriod}>
                <TabsList className="rounded-none bg-gray-100">
                  <TabsTrigger value="daily" className="rounded-none">Diario</TabsTrigger>
                  <TabsTrigger value="weekly" className="rounded-none">Semanal</TabsTrigger>
                  <TabsTrigger value="monthly" className="rounded-none">Mensual</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-gray-600">En semanal y mensual, el objetivo no supera la ingesta recomendada acumulada.</p>
              <p className="text-xs text-gray-500">Ritmo del periodo: {periodElapsedPercent}%</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <GoalBar label="Calorias" value={`${Math.round(consumedTotals.calories)} / ${Math.round(periodGoals.calories)} kcal`} percent={chartPercents.calories} icon={<Flame className="w-4 h-4 text-pink-accent" />} tone="pink" />
              <GoalBar label="Proteina" value={`${Math.round(consumedTotals.protein)} / ${Math.round(periodGoals.protein)} g`} percent={chartPercents.protein} icon={<Activity className="w-4 h-4 text-blue-600" />} tone="blue" />
              <GoalBar label="Carbohidratos" value={`${Math.round(consumedTotals.carbs)} / ${Math.round(periodGoals.carbs)} g`} percent={chartPercents.carbs} icon={<Activity className="w-4 h-4 text-green-600" />} tone="green" />
              <GoalBar label="Grasas" value={`${Math.round(consumedTotals.fats)} / ${Math.round(periodGoals.fats)} g`} percent={chartPercents.fats} icon={<Activity className="w-4 h-4 text-yellow-600" />} tone="yellow" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <GoalDonut label="Kcal" percent={chartPercents.calories} tone="pink" />
              <GoalDonut label="Prot" percent={chartPercents.protein} tone="blue" />
              <GoalDonut label="Carb" percent={chartPercents.carbs} tone="green" />
              <GoalDonut label="Grasa" percent={chartPercents.fats} tone="yellow" />
            </div>

            <div className="border-2 border-gray-200 p-4 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Menu automatizado ({goalPeriod})</p>
                  <p className="text-xs text-gray-600">Basado en tus recetas creadas y favoritas para completar macros.</p>
                </div>
                <Button variant="outline" className="border-2 border-gray-900 rounded-none" onClick={regenerateAutoMenu}>
                  Regenerar menu
                </Button>
              </div>
              {autoMenuRecipes.length === 0 ? (
                <p className="text-sm text-gray-500">Necesitas recetas con valores nutricionales en favoritos o en tus recetas para generar el menu.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {autoMenuRecipes.map((recipe) => {
                    const isConsumed = Boolean(consumedMap[recipe._id]);
                    return (
                      <button
                        key={`plan-${goalPeriod}-${recipe._id}`}
                        type="button"
                        onClick={() => toggleConsumedRecipe(recipe._id)}
                        className={`text-left border p-3 transition-colors ${isConsumed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-pink-accent'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">{recipe.title}</p>
                          <Badge className={`rounded-none border ${isConsumed ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}>
                            {isConsumed ? 'Consumida' : 'Pendiente'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.round(recipe.nutrients.calories)} kcal | P {Math.round(recipe.nutrients.protein)}g | C {Math.round(recipe.nutrients.carbs)}g | G {Math.round(recipe.nutrients.fats)}g
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
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
                  <Link to="/profile" className="text-xs text-pink-accent hover:underline">Ver todos</Link>
                </div>
                {favoriteRecipes.length === 0 && <p className="text-sm text-gray-500">Aun no tienes recetas favoritas.</p>}
                <div className="max-h-[185px] overflow-y-auto pr-1 space-y-2">
                  {favoriteRecipes.map((recipe) => <MiniRecipeRow key={`fav-${recipe._id}`} recipe={recipe} />)}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Tus recetas</h3>
                  <Link to="/profile" className="text-xs text-pink-accent hover:underline">Gestionar</Link>
                </div>
                {myRecipes.length === 0 && <p className="text-sm text-gray-500">Todavia no publicaste recetas.</p>}
                <div className="max-h-[185px] overflow-y-auto pr-1 space-y-2">
                  {myRecipes.map((recipe) => <MiniRecipeRow key={`mine-${recipe._id}`} recipe={recipe} />)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rapidas</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link to="/lab"><Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent"><Zap className="w-4 h-4 mr-2" />NutraCore Lab</Button></Link>
            <Link to="/catalog"><Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent"><BookOpen className="w-4 h-4 mr-2" />Explorar recetas</Button></Link>
            <Link to="/news"><Button variant="outline" className="w-full justify-start border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent"><TrendingUp className="w-4 h-4 mr-2" />Ver noticias</Button></Link>
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
      <Badge className="kpi-value-badge rounded-none border-0 !text-4xl font-bold leading-none px-3 py-2">{value}</Badge>
    </Card>
  );
}

function GoalBar({ label, value, percent, icon, tone = 'pink' }) {
  const safePercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const gradientByTone = {
    pink: 'from-pink-500 via-pink-400 to-rose-500',
    blue: 'from-sky-500 via-blue-500 to-indigo-500',
    green: 'from-emerald-500 via-green-500 to-lime-500',
    yellow: 'from-amber-400 via-yellow-500 to-orange-500'
  };
  const gradient = gradientByTone[tone] || gradientByTone.pink;

  return (
    <div className="border-2 border-gray-200 p-3 bg-gray-50 relative overflow-hidden group">
      <div className="absolute inset-y-0 left-0 w-1 bg-pink-accent/30 group-hover:bg-pink-accent transition-colors" />
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
        <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`} style={{ width: `${safePercent}%` }} />
        <div className="absolute inset-y-0 left-0 w-10 bg-white/30 blur-sm animate-pulse" style={{ transform: `translateX(${Math.max(0, safePercent - 8)}%)` }} />
      </div>
      <div className="mt-2 flex justify-end"><span className="text-xs font-bold text-gray-600">{safePercent}%</span></div>
    </div>
  );
}

function GoalDonut({ label, percent, tone = 'pink' }) {
  const safePercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const toneColor = { pink: '#ff0a60', blue: '#2563eb', green: '#16a34a', yellow: '#ca8a04' };
  const color = toneColor[tone] || toneColor.pink;
  const size = 48;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safePercent / 100);

  return (
    <div className="border border-gray-200 bg-white p-3 flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">{safePercent}</div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">Objetivo</p>
      </div>
    </div>
  );
}

function MiniRecipeRow({ recipe }) {
  return (
    <div className="border border-gray-200 p-2 bg-white">
      <p className="font-semibold text-sm text-gray-900">{recipe.title}</p>
      <p className="text-xs text-gray-500">{categoryLabels[recipe.category] || recipe.category || 'Sin categoria'} | {recipe.prepTime || 0} min</p>
    </div>
  );
}
