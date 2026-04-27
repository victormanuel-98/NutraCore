import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { User, Camera, Save, Lock, Eye } from 'lucide-react';
import { CloudinaryUploadWidget } from './ui/CloudinaryUploadWidget';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserStats, updateUserGoals, updateUserProfile } from '../services/userService';
import { changePassword } from '../services/authService';
import { ProfileRecipeCollections } from './ProfileRecipeCollections';

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

const sanitizeNumericInput = (rawValue, allowDecimal = false) => {
  const source = String(rawValue ?? '').replace(',', '.');
  let sanitized = source.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, '');

  if (allowDecimal) {
    const firstDot = sanitized.indexOf('.');
    if (firstDot !== -1) {
      sanitized = `${sanitized.slice(0, firstDot + 1)}${sanitized.slice(firstDot + 1).replace(/\./g, '')}`;
    }
  }

  return sanitized;
};

const formatNumericValue = (value, allowDecimal = false) => {
  if (!Number.isFinite(value)) return '0';
  if (!allowDecimal) return String(Math.max(0, Math.round(value)));
  return String(Math.max(0, Math.round(value * 10) / 10)).replace(/\.0$/, '');
};

export function Profile() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [passwordState, setPasswordState] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const profileRequestRef = useRef(0);
  const isEditingRef = useRef(false);
  const numericDraftRef = useRef({
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    dailyCalories: '0',
    protein: '0',
    carbs: '0',
    fats: '0'
  });
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

  const refreshStats = useCallback(async ({ silentErrors = true } = {}) => {
    if (!token) return;

    try {
      const statsResponse = await getUserStats(token);
      setStats(statsResponse?.data || null);
    } catch (error) {
      if (!silentErrors) {
        showNotification(error.message || 'No se pudieron actualizar las estadisticas', 'error');
      }
    }
  }, [token, showNotification]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      profileRequestRef.current += 1;
      const requestId = profileRequestRef.current;

      try {
        const [profileResponse, statsResponse] = await Promise.all([
          getUserProfile(token),
          getUserStats(token)
        ]);
        if (requestId !== profileRequestRef.current) return;

        const user = profileResponse?.data || {};
        const goals = user.goals || {};

        numericDraftRef.current = {
          age: user.age ?? '',
          height: user.height ?? '',
          weight: user.weight ?? '',
          targetWeight: goals.targetWeight ?? '',
          dailyCalories: String(goals.dailyCalories ?? 0),
          protein: String(goals.protein ?? 0),
          carbs: String(goals.carbs ?? 0),
          fats: String(goals.fats ?? 0)
        };

        if (!isEditingRef.current) {
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
        }

        setStats(statsResponse?.data || null);
      } catch (error) {
        showNotification(error.message || 'No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const bmi = useMemo(() => {
    if (stats?.bmi) return stats.bmi;
    const height = Number(profileData.height);
    const weight = Number(profileData.weight);
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [profileData.height, profileData.weight, stats]);

  const handleChange = (field, value) => {
    isEditingRef.current = true;
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericChange = (field, allowDecimal = false) => (event) => {
    isEditingRef.current = true;
    const sanitized = sanitizeNumericInput(event.target.value, allowDecimal);
    event.target.value = sanitized;
    numericDraftRef.current[field] = sanitized;
  };

  const handleNumericArrow = (field, { step = 1, allowDecimal = false } = {}) => (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();

    isEditingRef.current = true;
    const current = Number(numericDraftRef.current[field] === '' ? 0 : numericDraftRef.current[field]);
    const base = Number.isFinite(current) ? current : 0;
    const delta = event.key === 'ArrowUp' ? step : -step;
    const next = formatNumericValue(Math.max(0, base + delta), allowDecimal);
    numericDraftRef.current[field] = next;
    event.currentTarget.value = next;
  };

  const getOptionLabel = (options, value, fallback = 'Selecciona') => {
    const option = options.find((item) => item.value === value);
    return option?.label || fallback;
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      await Promise.all([
        updateUserProfile(
          {
            age: toNumberOrNull(numericDraftRef.current.age),
            gender: profileData.gender,
            height: toNumberOrNull(numericDraftRef.current.height),
            weight: toNumberOrNull(numericDraftRef.current.weight),
            avatar: profileData.avatar || null
          },
          token
        ),
        updateUserGoals(
          {
            targetWeight: toNumberOrNull(numericDraftRef.current.targetWeight),
            dailyCalories: Number(numericDraftRef.current.dailyCalories || 0),
            protein: Number(numericDraftRef.current.protein || 0),
            carbs: Number(numericDraftRef.current.carbs || 0),
            fats: Number(numericDraftRef.current.fats || 0),
            activityLevel: profileData.activityLevel,
            goal: profileData.goal
          },
          token
        )
      ]);
      isEditingRef.current = false;

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
      showNotification('Completa ambas contraseñas', 'info');
      return;
    }

    try {
      await changePassword(passwordState, token);
      setPasswordState({ currentPassword: '', newPassword: '' });
      showNotification('Contraseña actualizada', 'success');
    } catch (error) {
      showNotification(error.message || 'No se pudo actualizar la contraseña', 'error');
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
                  <input
                    id="age"
                    type="text"
                    inputMode="numeric"
                    defaultValue={numericDraftRef.current.age}
                    onChange={handleNumericChange('age')}
                    onKeyDown={handleNumericArrow('age')}
                    className="h-10 w-full border-2 border-gray-900 px-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genero</Label>
                  <Select value={profileData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base">
                      <span className="text-gray-900">{getOptionLabel(genderOptions, profileData.gender, 'Selecciona genero')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <input
                    id="height"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 175"
                    defaultValue={numericDraftRef.current.height}
                    onChange={handleNumericChange('height')}
                    onKeyDown={handleNumericArrow('height')}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <input
                    id="weight"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 70"
                    defaultValue={numericDraftRef.current.weight}
                    onChange={handleNumericChange('weight', true)}
                    onKeyDown={handleNumericArrow('weight', { step: 0.1, allowDecimal: true })}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Objetivos Nutricionales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select value={profileData.goal} onValueChange={(value) => handleChange('goal', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base">
                      <span className="text-gray-900">{getOptionLabel(goalOptions, profileData.goal, 'Selecciona objetivo')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {goalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Actividad</Label>
                  <Select value={profileData.activityLevel} onValueChange={(value) => handleChange('activityLevel', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base">
                      <span className="text-gray-900">{getOptionLabel(activityOptions, profileData.activityLevel, 'Selecciona actividad')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {activityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Peso objetivo (kg)</Label>
                  <input
                    id="targetWeight"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 68"
                    defaultValue={numericDraftRef.current.targetWeight}
                    onChange={handleNumericChange('targetWeight', true)}
                    onKeyDown={handleNumericArrow('targetWeight', { step: 0.1, allowDecimal: true })}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyCalories">Calorias diarias</Label>
                  <input
                    id="dailyCalories"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 2200"
                    defaultValue={numericDraftRef.current.dailyCalories}
                    onChange={handleNumericChange('dailyCalories')}
                    onKeyDown={handleNumericArrow('dailyCalories')}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Proteina (g)</Label>
                  <input
                    id="protein"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 140"
                    defaultValue={numericDraftRef.current.protein}
                    onChange={handleNumericChange('protein')}
                    onKeyDown={handleNumericArrow('protein')}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohidratos (g)</Label>
                  <input
                    id="carbs"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 220"
                    defaultValue={numericDraftRef.current.carbs}
                    onChange={handleNumericChange('carbs')}
                    onKeyDown={handleNumericArrow('carbs')}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fats">Grasas (g)</Label>
                  <input
                    id="fats"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 70"
                    defaultValue={numericDraftRef.current.fats}
                    onChange={handleNumericChange('fats')}
                    onKeyDown={handleNumericArrow('fats')}
                    className="h-10 w-full border-2 border-gray-900 px-3 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Lock className="w-4 h-4" />Cambiar contraseña</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Contraseña actual"
                    value={passwordState.currentPassword}
                    onChange={(e) => setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="h-10 w-full border-2 border-gray-900 px-3 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className={`absolute right-2 top-2 p-1 ${showCurrentPassword ? 'text-pink-accent' : 'text-gray-600 hover:text-pink-accent'}`}
                    aria-label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nueva contraseña"
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="h-10 w-full border-2 border-gray-900 px-3 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className={`absolute right-2 top-2 p-1 ${showNewPassword ? 'text-pink-accent' : 'text-gray-600 hover:text-pink-accent'}`}
                    aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handlePasswordChange}>Actualizar contraseña</Button>
            </section>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-pink-accent hover:bg-pink-accent/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Card>
        </div>

        <ProfileRecipeCollections token={token} onDataChanged={refreshStats} />
      </div>
    </div>
  );
}
