import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore     from '@/store/authStore';
import MainLayout       from '@/components/layout/MainLayout';
import AdminLayout      from '@/components/layout/AdminLayout';
import AuthLayout       from '@/components/layout/AuthLayout';
import Spinner          from '@/components/common/Spinner';

// ── Public pages
const HomePage           = lazy(() => import('@/pages/public/HomePage'));
const TombolaDetailPage  = lazy(() => import('@/pages/public/TombolaDetailPage'));
const GagnantsPage       = lazy(() => import('@/pages/public/GagnantsPage'));
const VerifierTicketPage = lazy(() => import('@/pages/public/VerifierTicketPage'));

// ── Auth pages
const ConnexionPage      = lazy(() => import('@/pages/auth/ConnexionPage'));
const InscriptionPage    = lazy(() => import('@/pages/auth/InscriptionPage'));
const ResetPage          = lazy(() => import('@/pages/auth/ResetPage'));
const ResetPassword      = lazy(() => import('@/pages/auth/ResetPassword'));

// ── User pages
const DashboardPage      = lazy(() => import('@/pages/user/DashboardPage'));
const MesTicketsPage     = lazy(() => import('@/pages/user/MesTicketsPage'));
const MesPaiementsPage   = lazy(() => import('@/pages/user/MesPaiementsPage'));
const MesParticipationsPage = lazy(() => import('@/pages/user/MesParticipationsPage'));
const NotificationsPage  = lazy(() => import('@/pages/user/NotificationsPage'));
const ProfilPage         = lazy(() => import('@/pages/user/ProfilPage'));
const PaiementPage       = lazy(() => import('@/pages/user/PaiementPage'));

// ── Admin pages
const AdminDashPage      = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminTombolasPage  = lazy(() => import('@/pages/admin/AdminTombolasPage'));
const AdminUsersPage     = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminTransactPage  = lazy(() => import('@/pages/admin/AdminTransactionsPage'));
const AdminTiragePage    = lazy(() => import('@/pages/admin/AdminTiragePage'));

// ── Route Guards
function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth/connexion" replace />;
}
function RequireAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/connexion" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
function GuestOnly({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public (MainLayout with header + footer) ── */}
        <Route element={<MainLayout />}>
          <Route index                    element={<HomePage />} />
          <Route path="tombolas/:id"      element={<TombolaDetailPage />} />
          <Route path="gagnants"          element={<GagnantsPage />} />
          <Route path="verifier-ticket"   element={<VerifierTicketPage />} />
        </Route>

        {/* ── Auth (centred card on gradient) ── */}
        <Route element={<GuestOnly><AuthLayout /></GuestOnly>}>
          <Route path="auth/connexion"           element={<ConnexionPage />} />
          <Route path="auth/inscription"         element={<InscriptionPage />} />
          <Route path="auth/mot-de-passe-oublie" element={<ResetPage />} />
          <Route path="auth/reset-password"      element={<ResetPassword />} />
        </Route>

        {/* ── User (MainLayout, auth required) ── */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="dashboard"            element={<DashboardPage />} />
          <Route path="mes-tickets"          element={<MesTicketsPage />} />
          <Route path="mes-paiements"        element={<MesPaiementsPage />} />
          <Route path="mes-participations"   element={<MesParticipationsPage />} />
          <Route path="notifications"        element={<NotificationsPage />} />
          <Route path="profil"               element={<ProfilPage />} />
          <Route path="paiement/:tombolaId"  element={<PaiementPage />} />
        </Route>

        {/* ── Admin (AdminLayout, admin required) ── */}
        <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index                element={<AdminDashPage />} />
          <Route path="tombolas"      element={<AdminTombolasPage />} />
          <Route path="utilisateurs"  element={<AdminUsersPage />} />
          <Route path="transactions"  element={<AdminTransactPage />} />
          <Route path="tirage/:id"    element={<AdminTiragePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
