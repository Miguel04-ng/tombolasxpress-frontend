import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import Icon from '@/components/common/Icon';

const NAV = [
  { to: '/admin',              label: 'Dashboard',    icon: 'dashboard',              end: true },
  { to: '/admin/tombolas',     label: 'Tombolas',     icon: 'confirmation_number' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'people' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'account_balance_wallet' },
];

function SidebarContent({ onNav }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon name="admin_panel_settings" className="text-white text-base" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">TombolaXpress</p>
          <p className="text-blue-200 text-xs">Administration</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon name={icon} className="text-base" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-all">
          <Icon name="public" className="text-base" />Site public
        </Link>
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition-all">
          <Icon name="logout" className="text-base" />Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden lg:flex flex-col bg-primary-700 w-64 fixed inset-y-0 left-0 z-30">
        <SidebarContent onNav={() => {}} />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-primary-700 lg:hidden">
              <SidebarContent onNav={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button className="lg:hidden btn-ghost p-2" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
            <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.prenom?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
