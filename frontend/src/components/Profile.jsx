import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Lock, Save, User, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CloudinaryUploadWidget } from './ui/CloudinaryUploadWidget';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Progress } from './ui/progress';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserStats, updateUserGoals, updateUserProfile } from '../services/userService';
import { changePassword } from '../services/authService';
import { ProfileRecipeCollections } from './ProfileRecipeCollections';
import { emitProfileSync, subscribeToProfileSync } from '../utils/profileSync';

const goalOptions = [
  { value: 'lose-weight', label: 'Perder peso' },
  { value: 'maintain', label: 'Mantener peso' },
  { value: 'gain-muscle', label: 'Ganar músculo' },
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

const getTargetWeightSummary = (currentWeight, targetWeight, goal) => {
  const current = Number(currentWeight);
  const target = Number(targetWeight);
  if (!Number.isFinite(current) || !Number.isFinite(target) || current <= 0 || target <= 0) return null;

  const amount = Math.abs(target - current);
  const formattedAmount = formatNumericValue(amount, true);

  if (target < current || goal === 'lose-weight') {
    return `Objetivo configurado: bajar ${formattedAmount} kg`;
  }

  if (target > current || goal === 'gain-muscle') {
    return `Objetivo configurado: subir ${formattedAmount} kg`;
  }

  return 'Objetivo configurado: mantener el peso actual';
};

const getOptionLabel = (options, value, fallback = 'Selecciona') => {
  const option = options.find((item) => item.value === value);
  return option?.label || fallback;
};

const fieldInputClass =
  'h-10 sm:h-12 w-full border-2 border-gray-900 bg-white px-3 text-sm sm:text-base text-gray-900 rounded-none transition-all duration-150 hover:border-pink-accent focus:border-pink-accent focus:outline-none focus:ring-0';
const fieldInputDisabledClass = 'h-10 sm:h-12 w-full border-2 border-gray-200 bg-gray-50 px-3 text-sm sm:text-base text-gray-600 rounded-none';
const panelClass = 'bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none';

export function Profile() {
  const navigate = useNavigate();
  const { token, user, setSession } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activePasswordField, setActivePasswordField] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const profileRequestRef = useRef(0);
  const isEditingRef = useRef(false);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const passwordDraftRef = useRef({ currentPassword: '', newPassword: '' });
  const nutritionSectionRef = useRef(null);
  const securitySectionRef = useRef(null);
  const recipesSectionRef = useRef(null);
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
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    gender: 'prefer-not-to-say',
    height: '',
    weight: '',
    avatar: user?.avatar || '',
    targetWeight: '',
    dailyCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const hydrateProfile = useCallback((userData = {}, statsData = null, { preserveEdits = false } = {}) => {
    const goals = userData.goals || {};

    numericDraftRef.current = {
      age: userData.age ?? '',
      height: userData.height ?? '',
      weight: userData.weight ?? '',
      targetWeight: goals.targetWeight ?? '',
      dailyCalories: String(goals.dailyCalories ?? 0),
      protein: String(goals.protein ?? 0),
      carbs: String(goals.carbs ?? 0),
      fats: String(goals.fats ?? 0)
    };

    if (!preserveEdits) {
      setFormVersion((prev) => prev + 1);
      setProfileData({
        name: userData.name || user?.name || '',
        email: userData.email || user?.email || '',
        age: userData.age ?? '',
        gender: userData.gender || 'prefer-not-to-say',
        height: userData.height ?? '',
        weight: userData.weight ?? '',
        avatar: userData.avatar || user?.avatar || '',
        targetWeight: goals.targetWeight ?? '',
        dailyCalories: goals.dailyCalories ?? 0,
        protein: goals.protein ?? 0,
        carbs: goals.carbs ?? 0,
        fats: goals.fats ?? 0,
        activityLevel: goals.activityLevel || 'moderate',
        goal: goals.goal || 'maintain'
      });
    }

    setStats(statsData);
  }, [user?.avatar, user?.email, user?.name]);

  const refreshProfile = useCallback(async ({ silent = true, preserveEdits = false } = {}) => {
    if (!token) return null;

    if (!silent) {
      setLoading(true);
    }

    profileRequestRef.current += 1;
    const requestId = profileRequestRef.current;

    try {
      const [profileResponse, statsResponse] = await Promise.all([getUserProfile(token), getUserStats(token)]);
      if (requestId !== profileRequestRef.current) return null;

      const nextUser = profileResponse?.data || {};
      const nextStats = statsResponse?.data || null;
      hydrateProfile(nextUser, nextStats, { preserveEdits });
      setSession({ token, user: nextUser });
      return nextUser;
    } catch (error) {
      showNotification(error.message || 'No se pudo cargar el perfil', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [hydrateProfile, setSession, showNotification, token]);

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
    refreshProfile({ silent: false, preserveEdits: false });
  }, [refreshProfile]);

  useEffect(() => subscribeToProfileSync(() => {
    isEditingRef.current = false;
    refreshProfile({ silent: true, preserveEdits: false });
  }), [refreshProfile]);

  useLayoutEffect(() => {
    if (!activePasswordField) return;
    const target = activePasswordField === 'current' ? currentPasswordRef.current : newPasswordRef.current;
    if (!target) return;
    target.focus({ preventScroll: true });
    const caretPosition = target.value.length;
    target.setSelectionRange(caretPosition, caretPosition);
  }, [activePasswordField, showCurrentPassword, showNewPassword]);

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
      await refreshProfile({ silent: true, preserveEdits: false });
      emitProfileSync({ source: 'profile' });
      showNotification('Cambios guardados', 'success');
    } catch (error) {
      showNotification(error.message || 'No se pudo guardar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    const currentPassword = currentPasswordRef.current?.value || '';
    const newPassword = newPasswordRef.current?.value || '';

    if (!currentPassword || !newPassword) {
      showNotification('Completa ambas contraseñas', 'info');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }, token);
      passwordDraftRef.current = { currentPassword: '', newPassword: '' };
      if (currentPasswordRef.current) currentPasswordRef.current.value = '';
      if (newPasswordRef.current) newPasswordRef.current.value = '';
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
  const targetWeightSummary = getTargetWeightSummary(
    numericDraftRef.current.weight,
    numericDraftRef.current.targetWeight,
    profileData.goal
  );
  const goalProgressText = stats?.goalProgress
    ? `Actual ${stats.goalProgress.current} kg · Objetivo ${stats.goalProgress.target} kg`
    : 'Configura peso actual y objetivo para activar seguimiento.';

  const quickActions = [
    {
      title: 'Ajusta tus macros',
      text: 'Ve directo a estrategia nutricional para editar calorías y macros.',
      onClick: () => nutritionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    {
      title: 'Controla tu progreso',
      text: 'Salta a seguridad de cuenta o revisa el objetivo según lo que necesites actualizar.',
      onClick: () => securitySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    {
      title: 'Conecta con Dashboard',
      text: 'Abre el dashboard para comprobar que peso, objetivo y macros ya quedaron sincronizados.',
      onClick: () => navigate('/dashboard')
    },
    {
      title: 'Gestiona tus recetas',
      text: 'Baja hasta tus recetas guardadas y publicadas para revisarlas o editarlas.',
      onClick: () => recipesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 px-4 pb-10 pt-24 sm:px-6 lg:px-8 dark-pink-fields">
      <div className="mx-auto max-w-6xl space-y-4 overflow-x-hidden sm:space-y-6">
        <Card className={`${panelClass} p-4 sm:p-6 md:p-8 overflow-hidden`}>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] items-start">
            <div className="space-y-4 sm:space-y-5">
              <div className="relative inline-flex">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-gray-900 bg-pink-accent/12 shadow-[6px_6px_0px_0px_rgba(17,24,39,0.18)] sm:h-36 sm:w-36">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-20 w-20 text-pink-accent" />
                  )}
                </div>
                <CloudinaryUploadWidget onUploadSuccess={(url) => handleChange('avatar', url)} multiple={false} folder="nutracore/avatars">
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-900 bg-white text-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent active:scale-[0.98]"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </CloudinaryUploadWidget>
              </div>

              <div>
                <h1 className="text-xl leading-none text-gray-900 sm:text-3xl">{profileData.name || user?.name || 'Usuario'}</h1>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600 break-all">{profileData.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Perfil completado</p>
                <Progress value={completionPercent} className="h-3" />
                <p className="text-xs text-gray-600">{completionPercent}%</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="IMC" value={bmi || 'N/D'} />
              <StatTile label="Favoritos" value={stats?.totalFavorites ?? 0} />
              <StatTile label="Recetas" value={stats?.totalRecipes ?? 0} />
              <div className="sm:col-span-3 border-2 border-gray-200 bg-gray-50 p-3 sm:p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Estado del objetivo</p>
                <p className="text-sm text-gray-700">{goalProgressText}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px] items-start">
          <Card className={`${panelClass} p-4 sm:p-6 space-y-6 sm:space-y-8`}>
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Identidad y cuerpo</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Alias (fijo)"><input value={profileData.name} disabled className={fieldInputDisabledClass} /></Field>
                <Field label="Email"><input value={profileData.email} disabled className={fieldInputDisabledClass} /></Field>
                <Field label="Edad">
                  <input key={`age-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.age} onChange={handleNumericChange('age')} onKeyDown={handleNumericArrow('age')} className={fieldInputClass} />
                </Field>
                <Field label="Género">
                  <Select value={profileData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className={`${fieldInputClass} justify-between`}>
                      <span className="text-gray-900">{getOptionLabel(genderOptions, profileData.gender, 'Selecciona género')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-3 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Altura (cm)">
                  <input key={`height-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.height} onChange={handleNumericChange('height')} onKeyDown={handleNumericArrow('height')} className={fieldInputClass} />
                </Field>
                <Field label="Peso (kg)">
                  <input key={`weight-${formVersion}`} type="text" inputMode="decimal" defaultValue={numericDraftRef.current.weight} onChange={handleNumericChange('weight', true)} onKeyDown={handleNumericArrow('weight', { step: 0.1, allowDecimal: true })} className={fieldInputClass} />
                </Field>
              </div>
            </section>

            <section ref={nutritionSectionRef} className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Estrategia nutricional</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Objetivo">
                  <Select value={profileData.goal} onValueChange={(value) => handleChange('goal', value)}>
                    <SelectTrigger className={`${fieldInputClass} justify-between`}>
                      <span className="text-gray-900">{getOptionLabel(goalOptions, profileData.goal, 'Selecciona objetivo')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {goalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-3 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Actividad">
                  <Select value={profileData.activityLevel} onValueChange={(value) => handleChange('activityLevel', value)}>
                    <SelectTrigger className={`${fieldInputClass} justify-between`}>
                      <span className="text-gray-900">{getOptionLabel(activityOptions, profileData.activityLevel, 'Selecciona actividad')}</span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-900 rounded-none p-0">
                      {activityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-none px-5 py-3 text-base hover:bg-pink-accent hover:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Peso objetivo (kg)">
                  <input key={`targetWeight-${formVersion}`} type="text" inputMode="decimal" defaultValue={numericDraftRef.current.targetWeight} onChange={handleNumericChange('targetWeight', true)} onKeyDown={handleNumericArrow('targetWeight', { step: 0.1, allowDecimal: true })} className={fieldInputClass} />
                  {targetWeightSummary ? <p className="text-xs text-gray-600">{targetWeightSummary}</p> : null}
                </Field>
                <Field label="Calorias diarias">
                  <input key={`dailyCalories-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.dailyCalories} onChange={handleNumericChange('dailyCalories')} onKeyDown={handleNumericArrow('dailyCalories')} className={fieldInputClass} />
                </Field>
                <Field label="Proteina (g)">
                  <input key={`protein-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.protein} onChange={handleNumericChange('protein')} onKeyDown={handleNumericArrow('protein')} className={fieldInputClass} />
                </Field>
                <Field label="Carbohidratos (g)">
                  <input key={`carbs-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.carbs} onChange={handleNumericChange('carbs')} onKeyDown={handleNumericArrow('carbs')} className={fieldInputClass} />
                </Field>
                <Field label="Grasas (g)" className="sm:col-span-2">
                  <input key={`fats-${formVersion}`} type="text" inputMode="numeric" defaultValue={numericDraftRef.current.fats} onChange={handleNumericChange('fats')} onKeyDown={handleNumericArrow('fats')} className={fieldInputClass} />
                </Field>
              </div>
            </section>

            <section ref={securitySectionRef} className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Seguridad de cuenta
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  inputRef={currentPasswordRef}
                  inputKey={`current-password-${formVersion}`}
                  placeholder="Contraseña actual"
                  defaultValue={passwordDraftRef.current.currentPassword}
                  showPassword={showCurrentPassword}
                  onChange={(value) => {
                    setActivePasswordField('current');
                    passwordDraftRef.current.currentPassword = value;
                  }}
                  onToggleVisibility={() => setShowCurrentPassword((prev) => !prev)}
                />
                <PasswordField
                  inputRef={newPasswordRef}
                  inputKey={`new-password-${formVersion}`}
                  placeholder="Nueva contraseña"
                  defaultValue={passwordDraftRef.current.newPassword}
                  showPassword={showNewPassword}
                  onChange={(value) => {
                    setActivePasswordField('new');
                    passwordDraftRef.current.newPassword = value;
                  }}
                  onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handlePasswordChange}
                className="rounded-none border-2 border-gray-900 bg-white text-gray-900 hover:-translate-y-0.5 hover:border-pink-accent hover:bg-pink-50 hover:text-pink-accent"
              >
                Actualizar contraseña
              </Button>
            </section>

            <div className="flex justify-stretch sm:justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-none bg-pink-accent text-white hover:-translate-y-0.5 hover:bg-pink-accent/90 hover:shadow-[4px_4px_0px_0px_rgba(255,10,96,0.24)] sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Card>

          <Card className={`${panelClass} p-4 sm:p-6 space-y-3 sm:space-y-4`}>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Panel rápido</h3>
            {quickActions.map((action) => (
              <QuickTip key={action.title} title={action.title} text={action.text} onClick={action.onClick} />
            ))}
            <div className="border-2 border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Recordatorio</p>
              <p className="text-sm text-gray-700">Guardar cambios sincroniza tus objetivos con el resto de módulos.</p>
            </div>
          </Card>
        </div>

        <div ref={recipesSectionRef} className="min-w-0 max-w-full overflow-hidden">
          <ProfileRecipeCollections token={token} onDataChanged={refreshStats} />
        </div>
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

function PasswordField({ inputRef, inputKey, placeholder, defaultValue, showPassword, onChange, onToggleVisibility }) {
  return (
    <div className="relative">
      <input
        key={inputKey}
        ref={inputRef}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldInputClass} pr-12`}
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {showPassword ? (
          <Eye className="h-5 w-5 text-pink-accent" />
        ) : (
          <EyeOff className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="border-2 border-gray-200 bg-gray-50 p-3 sm:p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent hover:shadow-[4px_4px_0px_0px_rgba(255,10,96,0.14)]">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickTip({ title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border-2 border-gray-200 bg-white p-3 sm:p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-accent hover:bg-pink-50/40 active:scale-[0.99]"
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{text}</p>
    </button>
  );
}

