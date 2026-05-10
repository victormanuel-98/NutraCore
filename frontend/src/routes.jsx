import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Root } from './components/Root';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./components/Home').then((module) => ({ default: module.Home })));
const Login = lazy(() => import('./components/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./components/Register').then((module) => ({ default: module.Register })));
const Dashboard = lazy(() => import('./components/Dashboard').then((module) => ({ default: module.Dashboard })));
const Catalog = lazy(() => import('./components/Catalog').then((module) => ({ default: module.Catalog })));
const News = lazy(() => import('./components/News').then((module) => ({ default: module.News })));
const Profile = lazy(() => import('./components/Profile').then((module) => ({ default: module.Profile })));
const NotFound = lazy(() => import('./components/NotFound').then((module) => ({ default: module.NotFound })));
const VerifyEmail = lazy(() => import('./components/VerifyEmail').then((module) => ({ default: module.VerifyEmail })));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage').then((module) => ({ default: module.CreateRecipePage })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })));
const TermsPage = lazy(() => import('./components/TermsPage').then((module) => ({ default: module.TermsPage })));
const CookiesPolicyPage = lazy(() => import('./components/CookiesPolicyPage').then((module) => ({ default: module.CookiesPolicyPage })));
const LegalNoticePage = lazy(() => import('./components/LegalNoticePage').then((module) => ({ default: module.LegalNoticePage })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));

function RouteError() {
  return (
    <div style={{ padding: 24, fontFamily: "'Bitcount Single', monospace" }}>
      <h1 style={{ marginBottom: 8 }}>Error al cargar la aplicación</h1>
      <p>Revisa la consola del navegador para ver el detalle del error.</p>
    </div>
  );
}

function RouteLoader() {
  return (
    <div className="route-loader-screen" aria-live="polite" aria-busy="true">
      <div className="route-loader-center">
        <p className="route-loader-copy">Cargando vista...</p>
      </div>
      <div className="route-loader-corner-mark" aria-label="NutraCore">
        <svg viewBox="0 0 260 220" role="img" className="hexa-n-svg" aria-hidden="true">
          <polygon fill="#ff0a60" points="92,24 168,24 206,90 168,156 92,156 54,90" />
          <g fill="#ffffff" transform="translate(90,79)">
            <path d="M0,4 C0,1 4,0 10,0 H24 C30,0 33,2 33,6 V28 H21 V6 H14 V28 H0 Z" />
            <path d="M38,0 H50 V22 H56 V0 H68 V25 C68,29 63,30 57,30 H45 C40,30 38,29 38,27 Z" />
            <path d="M72,0 H86 L83,18 H75 Z" />
            <rect x="75" y="21" width="8" height="8" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function withSuspense(node) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'login', element: withSuspense(<Login />) },
      { path: 'register', element: withSuspense(<Register />) },
      { path: 'verify-email', element: withSuspense(<VerifyEmail />) },
      { path: 'privacy', element: withSuspense(<PrivacyPolicy />) },
      { path: 'terms', element: withSuspense(<TermsPage />) },
      { path: 'cookies', element: withSuspense(<CookiesPolicyPage />) },
      { path: 'legal-notice', element: withSuspense(<LegalNoticePage />) },
      {
        path: 'dashboard',
        element: withSuspense(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      { path: 'catalog', element: withSuspense(<Catalog />) },
      {
        path: 'lab',
        element: withSuspense(
          <ProtectedRoute>
            <CreateRecipePage />
          </ProtectedRoute>
        )
      },
      { path: 'news', element: withSuspense(<News />) },
      {
        path: 'profile',
        element: withSuspense(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/dashboard',
        element: withSuspense(
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      { path: '*', element: withSuspense(<NotFound />) }
    ]
  }
]);
