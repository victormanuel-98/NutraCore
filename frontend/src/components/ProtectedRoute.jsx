import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir al login pero guardando la ubicación de donde venía
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
