import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando correo...');

  const hasRun = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Faltan datos para verificar el correo.');
      return;
    }

    // Evitar que se ejecute dos veces (común en React 18 desarrollo)
    if (hasRun.current) return;
    hasRun.current = true;

    const runVerification = async () => {
      try {
        const response = await verifyEmail({ token, email });
        setStatus('success');
        setMessage(response.message || 'Correo verificado correctamente.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'No se pudo verificar el correo.');
      }
    };

    runVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <h1 className="text-3xl text-gray-900 mb-4">Verificación de correo</h1>
        <p className={`mb-6 ${status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-700' : 'text-gray-600'}`}>
          {message}
        </p>

        {status !== 'loading' && (
          <Link to="/login">
            <Button className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white">Ir a Iniciar Sesión</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}

