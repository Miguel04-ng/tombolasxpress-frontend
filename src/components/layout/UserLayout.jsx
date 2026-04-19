import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',      label: 'Tableau de bord',   icon: 'dashboard' },
  { to: '/mes-tickets',    label: 'Mes tickets',        icon: 'confirmation_number' },
  { to: '/participations', label: 'Participations',     icon: 'history' },
  { to: '/mes-paiements',  label: 'Paiements',          icon: 'payments' },
  { to: '/notifications',  label: 'Notifications',      icon: 'notifications' },
  { to: '/profil',         label: 'Mon profil',         icon: 'person' },
];

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const SideNav = () => (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-primary-600">
        <span className="text-xl">🎟️</span>
        <span className="text-white font-bold">TombolaXpress</span>
      </Link>
      <div className="px-4 py-4 border-b border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.prenom} {user?.nom}</p>
            <p className="text-primary-300 text-xs truncate">{user?.telephone}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link key={item.to} to={item.to} onClick={() => setSideOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive(item.to)
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
            <span className="material-icons-round text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-primary-600 space-y-1">
        <Link to="/" onClick={() => setSideOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-primary-200 hover:bg-white/10 hover:text-white transition-all">
          <span className="material-icons-round text-base">storefront</span>
          Voir les tombolas
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 w-full transition-all">
          <span className="material-icons-round text-base">logout</span>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-primary-700 fixed inset-y-0 left-0 z-30">
        <SideNav />
      </aside>

      {/* Sidebar mobile overlay */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSideOpen(false)} />
          <aside className="relative w-72 bg-primary-700 flex flex-col h-full z-50">
            <SideNav />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
          <button onClick={() => setSideOpen(true)} className="p-2 text-gray-600">
            <span className="material-icons-round">menu</span>
          </button>
          <span className="font-semibold text-primary-700">TombolaXpress</span>
          <Link to="/notifications" className="p-2 text-gray-600">
            <span className="material-icons-round">notifications</span>
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
