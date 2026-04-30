import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 * También puede limitar por roles.
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const currentRole = user?.role || 'user';
    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
