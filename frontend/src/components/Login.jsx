import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isEmailLocalPartTooLong, validateEmailAddress } from '../utils/emailValidation';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const handleEmailChange = (value) => {
    if (isEmailLocalPartTooLong(value)) {
      return;
    }

    setEmail(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    const { isValid, normalizedEmail, error: emailError } = validateEmailAddress(email);
    if (!isValid) {
      setError(emailError);
      return;
    }

    try {
      await login({ email: normalizedEmail, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setInfo('');

    const { isValid, normalizedEmail, error: emailError } = validateEmailAddress(email);

    if (!normalizedEmail) {
      setError('Introduce tu email para reenviar la verificación');
      return;
    }

    if (!isValid) {
      setError(emailError);
      return;
    }

    try {
      const response = await resendVerification(normalizedEmail);
      setInfo(response.message || 'Correo de verificación reenviado');
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el correo de verificación');
    }
  };

  const mustVerifyEmail = error.toLowerCase().includes('verificar tu correo');

  return (
    <div className="min-h-screen bg-gray-50 dark-pink-fields">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center mb-6 p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <h1 className="text-4xl text-gray-900 mb-2">Bienvenido!</h1>
            <p className="text-gray-600">Inicia sesión para continuar con tu plan nutricional.</p>
          </Card>

          <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(event) => handleEmailChange(event.target.value)}
                    className="pl-10 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Máximo 30 caracteres antes de @.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10 pr-12 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-sm transition-colors hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 pixel-icon text-pink-accent" strokeWidth={2.7} />
                    ) : (
                      <EyeOff className="w-5 h-5 pixel-icon text-gray-400" strokeWidth={2.7} />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && <p className="text-sm text-green-700">{info}</p>}
              {mustVerifyEmail && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-gray-900 rounded-none hover:bg-pink-50 hover:border-pink-accent"
                  onClick={handleResendVerification}
                >
                  Reenviar correo de verificación
                </Button>
              )}

              <Button type="submit" className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white py-6 rounded-none" disabled={isLoading}>
                {isLoading ? 'Accediendo...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                No tienes una cuenta{' '}
                <Link to="/register" className="text-pink-accent hover:underline font-medium">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
