import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Target, Flame, Activity, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../services/userService';

const numberOrDefault = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError('');
        const response = await getUserStats(token);
        setStats(response?.data || null);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token]);

  const goals = user?.goals || {};
  const dailyGoals = useMemo(
    () => ({
      calories: numberOrDefault(goals.dailyCalories, 0),
      protein: numberOrDefault(goals.protein, 0),
      carbs: numberOrDefault(goals.carbs, 0),
      fats: numberOrDefault(goals.fats, 0)
    }),
    [goals]
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {user?.name || 'Usuario'}</h1>
          <p className="text-gray-600">Resumen de tu cuenta y objetivos configurados.</p>
        </div>

        {loading && <p className="text-gray-500">Cargando estadisticas...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-pink-accent" />
              <h2 className="text-xl font-bold text-gray-900">Objetivos diarios</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <MetricCard label="Calorias" value={`${dailyGoals.calories} kcal`} icon={<Flame className="w-4 h-4 text-pink-accent" />} />
              <MetricCard label="Proteina" value={`${dailyGoals.protein} g`} icon={<Activity className="w-4 h-4 text-blue-600" />} />
              <MetricCard label="Carbohidratos" value={`${dailyGoals.carbs} g`} icon={<Activity className="w-4 h-4 text-green-600" />} />
              <MetricCard label="Grasas" value={`${dailyGoals.fats} g`} icon={<Activity className="w-4 h-4 text-yellow-600" />} />
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Progreso hacia peso objetivo</p>
              <Progress value={stats?.goalProgress?.progress || 0} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {stats?.goalProgress
                  ? `${stats.goalProgress.progress}% | Actual: ${stats.goalProgress.current} kg | Objetivo: ${stats.goalProgress.target} kg`
                  : 'Configura tu peso objetivo en Perfil para ver este progreso.'}
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Resumen rapido</h2>
            <SummaryRow label="IMC" value={stats?.bmi ?? 0} />
            <SummaryRow label="Favoritos" value={stats?.totalFavorites ?? 0} />
            <SummaryRow label="Noticias guardadas" value={stats?.totalSavedNews ?? 0} />
            <SummaryRow label="Recetas creadas" value={stats?.totalRecipes ?? 0} />
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rapidas</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link to="/lab">
              <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                <Zap className="w-4 h-4 mr-2" />
                NutraCore Lab
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar recetas
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent">
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

function MetricCard({ label, value, icon }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      <Badge className="bg-white text-gray-900 border border-gray-200">{value}</Badge>
    </div>
  );
}
