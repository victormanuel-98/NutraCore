import { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { User, Camera, Save, Lock } from 'lucide-react';
import { CloudinaryUploadWidget } from './ui/CloudinaryUploadWidget';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserStats, updateUserGoals, updateUserProfile } from '../services/userService';
import { changePassword } from '../services/authService';

const goalOptions = [
  { value: 'lose-weight', label: 'Perder peso' },
  { value: 'maintain', label: 'Mantener peso' },
  { value: 'gain-muscle', label: 'Ganar musculo' },
  { value: 'improve-health', label: 'Mejorar salud' }
];

const activityOptions = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligero' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'active', label: 'Activo' },
  { value: 'very-active', label: 'Muy activo' }
];

const genderOptions = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer-not-to-say', label: 'Prefiero no decirlo' }
];

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function Profile() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [passwordState, setPasswordState] = useState({ currentPassword: '', newPassword: '' });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'prefer-not-to-say',
    height: '',
    weight: '',
    avatar: '',
    targetWeight: '',
    dailyCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const [profileResponse, statsResponse] = await Promise.all([
          getUserProfile(token),
          getUserStats(token)
        ]);

        const user = profileResponse?.data || {};
        const goals = user.goals || {};

        setProfileData({
          name: user.name || '',
          email: user.email || '',
          age: user.age ?? '',
          gender: user.gender || 'prefer-not-to-say',
          height: user.height ?? '',
          weight: user.weight ?? '',
          avatar: user.avatar || '',
          targetWeight: goals.targetWeight ?? '',
          dailyCalories: goals.dailyCalories ?? 0,
          protein: goals.protein ?? 0,
          carbs: goals.carbs ?? 0,
          fats: goals.fats ?? 0,
          activityLevel: goals.activityLevel || 'moderate',
          goal: goals.goal || 'maintain'
        });

        setStats(statsResponse?.data || null);
      } catch (error) {
        showNotification(error.message || 'No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, showNotification]);

  const bmi = useMemo(() => {
    if (stats?.bmi) return stats.bmi;
    const height = Number(profileData.height);
    const weight = Number(profileData.weight);
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [profileData.height, profileData.weight, stats]);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      await Promise.all([
        updateUserProfile(
          {
            age: toNumberOrNull(profileData.age),
            gender: profileData.gender,
            height: toNumberOrNull(profileData.height),
            weight: toNumberOrNull(profileData.weight),
            avatar: profileData.avatar || null
          },
          token
        ),
        updateUserGoals(
          {
            targetWeight: toNumberOrNull(profileData.targetWeight),
            dailyCalories: Number(profileData.dailyCalories),
            protein: Number(profileData.protein),
            carbs: Number(profileData.carbs),
            fats: Number(profileData.fats),
            activityLevel: profileData.activityLevel,
            goal: profileData.goal
          },
          token
        )
      ]);

      showNotification('Perfil actualizado correctamente', 'success');
    } catch (error) {
      showNotification(error.message || 'No se pudo guardar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      showNotification('Completa ambas contrasenas', 'info');
      return;
    }

    try {
      await changePassword(passwordState, token);
      setPasswordState({ currentPassword: '', newPassword: '' });
      showNotification('Contrasena actualizada', 'success');
    } catch (error) {
      showNotification(error.message || 'No se pudo actualizar la contrasena', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu informacion y objetivos</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-pink-accent mx-auto flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)' }}>
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>

                <CloudinaryUploadWidget
                  onUploadSuccess={(url) => handleChange('avatar', url)}
                  multiple={false}
                  folder="nutracore/avatars"
                >
                  <button className="absolute -bottom-2 -right-2 bg-white p-2 border-2 border-gray-900">
                    <Camera className="w-4 h-4" />
                  </button>
                </CloudinaryUploadWidget>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">{profileData.name || 'Usuario'}</h2>
                <p className="text-sm text-gray-600">{profileData.email}</p>
              </div>

              <div className="text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">IMC</span><span className="font-semibold">{bmi || 'N/D'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Favoritos</span><span className="font-semibold">{stats?.totalFavorites ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Recetas</span><span className="font-semibold">{stats?.totalRecipes ?? 0}</span></div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none space-y-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Datos Personales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Alias (fijo)</Label>
                  <input id="name" value={profileData.name} disabled className="h-10 w-full border-2 border-gray-300 px-3 bg-gray-100 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <input id="email" value={profileData.email} disabled className="h-10 w-full border-2 border-gray-300 px-3 bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <input id="age" type="number" value={profileData.age} onChange={(e) => handleChange('age', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genero</Label>
                  <select id="gender" value={profileData.gender} onChange={(e) => handleChange('gender', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3 bg-white">
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <input id="height" type="number" value={profileData.height} onChange={(e) => handleChange('height', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <input id="weight" type="number" value={profileData.weight} onChange={(e) => handleChange('weight', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Objetivos Nutricionales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <select id="goal" value={profileData.goal} onChange={(e) => handleChange('goal', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3 bg-white">
                    {goalOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Actividad</Label>
                  <select id="activityLevel" value={profileData.activityLevel} onChange={(e) => handleChange('activityLevel', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3 bg-white">
                    {activityOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Peso objetivo (kg)</Label>
                  <input id="targetWeight" type="number" value={profileData.targetWeight} onChange={(e) => handleChange('targetWeight', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyCalories">Calorias diarias</Label>
                  <input id="dailyCalories" type="number" value={profileData.dailyCalories} onChange={(e) => handleChange('dailyCalories', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Proteina (g)</Label>
                  <input id="protein" type="number" value={profileData.protein} onChange={(e) => handleChange('protein', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohidratos (g)</Label>
                  <input id="carbs" type="number" value={profileData.carbs} onChange={(e) => handleChange('carbs', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fats">Grasas (g)</Label>
                  <input id="fats" type="number" value={profileData.fats} onChange={(e) => handleChange('fats', e.target.value)} className="h-10 w-full border-2 border-gray-900 px-3" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Lock className="w-4 h-4" />Cambiar contrasena</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Contrasena actual"
                  value={passwordState.currentPassword}
                  onChange={(e) => setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="h-10 w-full border-2 border-gray-900 px-3"
                />
                <input
                  type="password"
                  placeholder="Nueva contrasena"
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="h-10 w-full border-2 border-gray-900 px-3"
                />
              </div>
              <Button type="button" variant="outline" onClick={handlePasswordChange}>Actualizar contrasena</Button>
            </section>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-pink-accent hover:bg-pink-accent/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
