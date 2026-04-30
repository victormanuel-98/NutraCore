import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Root } from './components/Root';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { Catalog } from './components/Catalog';
import { News } from './components/News';
import { Profile } from './components/Profile';
import { NotFound } from './components/NotFound';
import { VerifyEmail } from './components/VerifyEmail';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsPage } from './components/TermsPage';
import { CookiesPolicyPage } from './components/CookiesPolicyPage';
import { LegalNoticePage } from './components/LegalNoticePage';
import { AdminDashboard } from './components/AdminDashboard';

function RouteError() {
  return (
    <div style={{ padding: 24, fontFamily: "'Bitcount Single', monospace" }}>
      <h1 style={{ marginBottom: 8 }}>Error al cargar la aplicación</h1>
      <p>Revisa la consola del navegador para ver el detalle del error.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'cookies', element: <CookiesPolicyPage /> },
      { path: 'legal-notice', element: <LegalNoticePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      { path: 'catalog', element: <Catalog /> },
      {
        path: 'lab',
        element: (
          <ProtectedRoute>
            <CreateRecipePage />
          </ProtectedRoute>
        )
      },
      { path: 'news', element: <News /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
