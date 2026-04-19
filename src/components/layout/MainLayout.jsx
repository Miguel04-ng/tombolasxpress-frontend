import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import Icon from '@/components/common/Icon';

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  const navLinks = [
    { to: '/',              label: 'Tombolas',  icon: 'confirmation_number' },
    { to: '/gagnants',      label: 'Gagnants',  icon: 'emoji_events' },
    { to: '/verifier-ticket', label: 'Vérifier', icon: 'verified' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <Icon name="confirmation_number" className="text-white text-lg" />
              </div>
              <span className="font-bold text-xl text-primary-700 hidden sm:block">
                Tombola<span className="text-accent">Xpress</span>
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to} to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {isAdmin() && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-accent/10 text-accent' : 'text-accent hover:bg-red-50'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </nav>

            {/* Auth desktop */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.prenom?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user?.prenom}
                    </span>
                    <Icon name="expand_more" className="text-gray-400 text-base" />
                  </button>
                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-hover border border-gray-100 py-2 z-50"
                      >
                        {[
                          { to: '/dashboard',    label: 'Tableau de bord', icon: 'dashboard' },
                          { to: '/mes-tickets',  label: 'Mes tickets',      icon: 'confirmation_number' },
                          { to: '/mes-paiements',label: 'Mes paiements',    icon: 'payments' },
                          { to: '/profil',       label: 'Mon profil',       icon: 'person' },
                        ].map(({ to, label, icon }) => (
                          <Link key={to} to={to} onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name={icon} className="text-gray-400 text-base" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <Icon name="logout" className="text-base" />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/auth/connexion" className="btn-ghost text-sm">Connexion</Link>
                  <Link to="/auth/inscription" className="btn-primary text-sm py-2 px-4">S'inscrire</Link>
                </>
              )}
            </div>

            {/* Mobile menu btn */}
            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ to, label, icon }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                      }`
                    }
                  >
                    <Icon name={icon} className="text-base" />
                    {label}
                  </NavLink>
                ))}
                {isAdmin() && (
                  <NavLink to="/admin" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent">
                    <Icon name="admin_panel_settings" className="text-base" />Admin
                  </NavLink>
                )}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  {isAuthenticated ? (
                    <>
                      {[
                        { to: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
                        { to: '/mes-tickets', label: 'Mes tickets', icon: 'confirmation_number' },
                        { to: '/profil', label: 'Mon profil', icon: 'person' },
                      ].map(({ to, label, icon }) => (
                        <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600">
                          <Icon name={icon} className="text-base" />{label}
                        </Link>
                      ))}
                      <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 mt-1">
                        <Icon name="logout" className="text-base" />Déconnexion
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to="/auth/connexion" onClick={() => setMenuOpen(false)} className="btn-outline w-full justify-center">Connexion</Link>
                      <Link to="/auth/inscription" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center">S'inscrire</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-primary-700 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="confirmation_number" className="text-white text-base" />
                </div>
                <span className="font-bold text-lg">TombolaXpress</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                La première plateforme de tombola en ligne au Cameroun. Transparente, sécurisée, accessible via Mobile Money.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                {[['/', 'Tombolas actives'], ['/gagnants', 'Historique gagnants'], ['/verifier-ticket', 'Vérifier un ticket']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Paiements acceptés</h4>
              <div className="flex gap-3">
                <div className="bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-2 rounded-lg">MTN MoMo</div>
                <div className="bg-orange-500 text-white font-bold text-xs px-3 py-2 rounded-lg">Orange Money</div>
              </div>
              <p className="text-blue-200 text-xs mt-4">© {new Date().getFullYear()} TombolaXpress. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
