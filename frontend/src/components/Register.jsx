import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Mail, Lock, User, Target, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../context/AuthContext';

const goalMap = {
  'weight-loss': 'lose-weight',
  'muscle-gain': 'gain-muscle',
  maintain: 'maintain',
  health: 'improve-health',
  performance: 'gain-muscle'
};

const genderMap = {
  hombre: 'male',
  mujer: 'female',
  otro: 'other'
};

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.gender) {
      setError('Selecciona un género');
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: genderMap[formData.gender] || 'other',
        goals: {
          goal: goalMap[formData.goal] || 'maintain'
        }
      });
      navigate('/login', {
        state: {
          message: response.message || 'Cuenta creada. Revisa tu correo para verificarla.'
        }
      });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta');
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl text-gray-900 mb-2">Únete a NutraCore!</h1>
            <p className="text-gray-600">Crea tu cuenta y comienza tu transformación nutricional.</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input id="name" type="text" value={formData.name} onChange={(event) => handleChange('name', event.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input id="email" type="email" value={formData.email} onChange={(event) => handleChange('email', event.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    className="pl-10 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 p-1 rounded-sm"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 pixel-icon text-pink-accent" strokeWidth={2.7} />
                    ) : (
                      <Eye className="w-5 h-5 pixel-icon text-gray-400" strokeWidth={2.7} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(event) => handleChange('confirmPassword', event.target.value)}
                    className="pl-10 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 p-1 rounded-sm"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 pixel-icon text-pink-accent" strokeWidth={2.7} />
                    ) : (
                      <Eye className="w-5 h-5 pixel-icon text-gray-400" strokeWidth={2.7} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hombre">Hombre</SelectItem>
                      <SelectItem value="mujer">Mujer</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo principal</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                  <Select value={formData.goal} onValueChange={(value) => handleChange('goal', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Perder peso</SelectItem>
                      <SelectItem value="muscle-gain">Ganar músculo</SelectItem>
                      <SelectItem value="maintain">Mantener peso</SelectItem>
                      <SelectItem value="health">Mejorar salud general</SelectItem>
                      <SelectItem value="performance">Rendimiento deportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && <p className="text-sm text-green-700">{info}</p>}

              <Button type="submit" className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white py-6" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Ya tienes cuenta{' '}
                <Link to="/login" className="text-pink-accent hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
