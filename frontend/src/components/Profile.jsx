import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { User, Camera, Save, Lock, Eye } from 'lucide-react';
import { CloudinaryUploadWidget } from './ui/CloudinaryUploadWidget';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Progress } from './ui/progress';
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
      if (!silentErrors) showNotification(error.message || 'No se pudieron actualizar las estadisticas', 'error');
    }
  }, [token, showNotification]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      profileRequestRef.current += 1;
      const requestId = profileRequestRef.current;

      try {
        const [profileResponse, statsResponse] = await Promise.all([getUserProfile(token), getUserStats(token)]);
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
        updateUserProfile({
          age: toNumberOrNull(numericDraftRef.current.age),
          gender: profileData.gender,
          height: toNumberOrNull(numericDraftRef.current.height),
          weight: toNumberOrNull(numericDraftRef.current.weight),
          avatar: profileData.avatar || null
        }, token),
        updateUserGoals({
          targetWeight: toNumberOrNull(numericDraftRef.current.targetWeight),
          dailyCalories: Number(numericDraftRef.current.dailyCalories || 0),
          protein: Number(numericDraftRef.current.protein || 0),
          carbs: Number(numericDraftRef.current.carbs || 0),
          fats: Number(numericDraftRef.current.fats || 0),
          activityLevel: profileData.activityLevel,
          goal: profileData.goal
        }, token)
      ]);

      isEditingRef.current = false;
      showNotification('Perfil actualizado correctamente', 'success');
      refreshStats({ silentErrors: true });
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
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const completionItems = [
    Boolean(profileData.age),
    Boolean(profileData.gender && profileData.gender !== 'prefer-not-to-say'),
    Boolean(profileData.height),
    Boolean(profileData.weight),
    Boolean(profileData.targetWeight),
    Number(profileData.dailyCalories) > 0
  ];
  const completionPercent = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 dark-pink-fields">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none overflow-hidden">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-pink-accent flex items-center justify-center overflow-hidden border-2 border-gray-900" style={{ clipPath: 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)' }}>
                  {profileData.avatar ? <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-white" />}
                </div>
                <CloudinaryUploadWidget onUploadSuccess={(url) => handleChange('avatar', url)} multiple={false} folder="nutracore/avatars">
                  <button className="absolute -bottom-2 -right-2 bg-white p-2 border-2 border-gray-900 hover:bg-pink-50">
                    <Camera className="w-4 h-4" />
                  </button>
                </CloudinaryUploadWidget>
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 leading-none">{profileData.name || 'Usuario'}</h1>
                <p className="text-sm text-gray-600 mt-2">{profileData.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Perfil completado</p>
                <Progress value={completionPercent} className="h-3" />
                <p className="text-xs text-gray-600">{completionPercent}%</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <StatTile label="IMC" value={bmi || 'N/D'} />
              <StatTile label="Favoritos" value={stats?.totalFavorites ?? 0} />
              <StatTile label="Recetas" value={stats?.totalRecipes ?? 0} />
              <div className="sm:col-span-3 border-2 border-gray-200 p-3 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Estado del objetivo</p>
                <p className="text-sm text-gray-700">{stats?.goalProgress ? `Actual ${stats.goalProgress.current} kg · Objetivo ${stats.goalProgress.target} kg` : 'Configura peso actual y objetivo para activar seguimiento.'}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none space-y-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Identidad y cuerpo</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Alias (fijo)"><input value={profileData.name} disabled className="h-10 w-full border-2 border-gray-300 px-3 bg-gray-100" /></Field>
                <Field label="Email"><input value={profileData.email} disabled className="h-10 w-full border-2 border-gray-300 px-3 bg-gray-100" /></Field>
                <Field label="Edad"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.age} onChange={handleNumericChange('age')} onKeyDown={handleNumericArrow('age')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Genero">
                  <Select value={profileData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base"><span className="text-gray-900">{getOptionLabel(genderOptions, profileData.gender, 'Selecciona genero')}</span></SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">{genderOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Altura (cm)"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.height} onChange={handleNumericChange('height')} onKeyDown={handleNumericArrow('height')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Peso (kg)"><input type="text" inputMode="decimal" defaultValue={numericDraftRef.current.weight} onChange={handleNumericChange('weight', true)} onKeyDown={handleNumericArrow('weight', { step: 0.1, allowDecimal: true })} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Estrategia nutricional</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Objetivo">
                  <Select value={profileData.goal} onValueChange={(value) => handleChange('goal', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base"><span className="text-gray-900">{getOptionLabel(goalOptions, profileData.goal, 'Selecciona objetivo')}</span></SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">{goalOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Actividad">
                  <Select value={profileData.activityLevel} onValueChange={(value) => handleChange('activityLevel', value)}>
                    <SelectTrigger className="h-10 w-full border-2 border-gray-900 px-3 bg-white rounded-none text-base"><span className="text-gray-900">{getOptionLabel(activityOptions, profileData.activityLevel, 'Selecciona actividad')}</span></SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">{activityOptions.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-none px-5 py-2.5 text-base hover:bg-pink-accent hover:text-white">{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Peso objetivo (kg)"><input type="text" inputMode="decimal" defaultValue={numericDraftRef.current.targetWeight} onChange={handleNumericChange('targetWeight', true)} onKeyDown={handleNumericArrow('targetWeight', { step: 0.1, allowDecimal: true })} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Calorias diarias"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.dailyCalories} onChange={handleNumericChange('dailyCalories')} onKeyDown={handleNumericArrow('dailyCalories')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Proteina (g)"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.protein} onChange={handleNumericChange('protein')} onKeyDown={handleNumericArrow('protein')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Carbohidratos (g)"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.carbs} onChange={handleNumericChange('carbs')} onKeyDown={handleNumericArrow('carbs')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
                <Field label="Grasas (g)" className="sm:col-span-2"><input type="text" inputMode="numeric" defaultValue={numericDraftRef.current.fats} onChange={handleNumericChange('fats')} onKeyDown={handleNumericArrow('fats')} className="h-10 w-full border-2 border-gray-900 px-3" /></Field>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Lock className="w-4 h-4" />Seguridad de cuenta</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input type={showCurrentPassword ? 'text' : 'password'} placeholder="Contraseña actual" value={passwordState.currentPassword} onChange={(e) => setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))} className="h-10 w-full border-2 border-gray-900 px-3 pr-10" />
                  <button type="button" onClick={() => setShowCurrentPassword((p) => !p)} className={`absolute right-2 top-2 p-1 ${showCurrentPassword ? 'text-pink-accent' : 'text-gray-600 hover:text-pink-accent'}`}><Eye className="w-5 h-5" /></button>
                </div>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="Nueva contraseña" value={passwordState.newPassword} onChange={(e) => setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))} className="h-10 w-full border-2 border-gray-900 px-3 pr-10" />
                  <button type="button" onClick={() => setShowNewPassword((p) => !p)} className={`absolute right-2 top-2 p-1 ${showNewPassword ? 'text-pink-accent' : 'text-gray-600 hover:text-pink-accent'}`}><Eye className="w-5 h-5" /></button>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handlePasswordChange}>Actualizar contraseña</Button>
            </section>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Panel rapido</h3>
            <QuickTip title="Ajusta tus macros" text="Si cambias entrenamiento, revisa calorias y proteina el mismo dia." />
            <QuickTip title="Controla tu progreso" text="Comparar peso actual y objetivo mejora la adherencia semanal." />
            <QuickTip title="Conecta con Dashboard" text="Despues de guardar, revisa el menu automatico para validar cobertura nutricional." />
            <div className="border-2 border-gray-200 p-3 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Recordatorio</p>
              <p className="text-sm text-gray-700">Guardar cambios sincroniza tus objetivos con el resto de módulos.</p>
            </div>
          </Card>
        </div>

        <ProfileRecipeCollections token={token} onDataChanged={refreshStats} />
      </div>
    </div>
  );
}

function Field({ label, className = '', children }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="border-2 border-gray-200 p-3 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickTip({ title, text }) {
  return (
    <div className="border border-gray-200 p-3 bg-white">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{text}</p>
    </div>
  );
}
