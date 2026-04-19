import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function PublicLayout({ minimal = false }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
    setMenuOpen(false);
  };

  if (minimal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex flex-col">
        <div className="flex justify-center py-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="text-white font-bold text-xl">TombolaXpress</span>
          </Link>
        </div>
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <Outlet />
        </main>
        <p className="text-center text-primary-200 text-xs pb-6">
          © {new Date().getFullYear()} TombolaXpress.cm — Jeu sécurisé et transparent
        </p>
      </div>
    );
  }

  const navLinks = [
    { to: '/',             label: 'Accueil',        icon: 'home' },
    { to: '/gagnants',     label: 'Gagnants',       icon: 'emoji_events' },
    { to: '/verifier-ticket', label: 'Vérifier',    icon: 'verified' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-primary-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🎟️</span>
            <span className="text-white font-bold text-lg hidden sm:block">TombolaXpress</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(l.to) ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                <span className="material-icons-round text-base">{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="btn-ghost text-white text-sm hover:bg-white/10 px-3 py-1.5">
                    <span className="material-icons-round text-base">admin_panel_settings</span>
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="btn-outline border-white text-white hover:bg-white/10 text-sm py-2">
                  <span className="material-icons-round text-base">dashboard</span>
                  Mon espace
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-primary-100 hover:bg-white/10 text-sm py-2">
                  <span className="material-icons-round text-base">logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/connexion" className="text-primary-100 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                  Se connecter
                </Link>
                <Link to="/auth/inscription" className="btn-accent text-sm py-2">
                  <span className="material-icons-round text-base">person_add</span>
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            <span className="material-icons-round">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-primary-800 border-t border-primary-600 px-4 py-4 space-y-2">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-primary-100 hover:bg-white/10 hover:text-white">
                <span className="material-icons-round text-base">{l.icon}</span>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-primary-600 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white bg-white/10">
                    <span className="material-icons-round text-base">dashboard</span>
                    Mon espace
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-300 hover:bg-white/10 w-full">
                    <span className="material-icons-round text-base">logout</span>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/connexion" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-primary-100 hover:bg-white/10">
                    <span className="material-icons-round text-base">login</span>
                    Se connecter
                  </Link>
                  <Link to="/auth/inscription" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent text-white font-semibold">
                    <span className="material-icons-round text-base">person_add</span>
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-primary-900 text-primary-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎟️</span>
              <span className="text-white font-bold text-lg">TombolaXpress</span>
            </div>
            <p className="text-sm leading-relaxed">
              La première plateforme de tombola en ligne au Cameroun. Transparente, sécurisée et accessible via Mobile Money.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navigation</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Tombolas actives</Link></li>
              <li><Link to="/gagnants" className="hover:text-white transition-colors">Historique gagnants</Link></li>
              <li><Link to="/verifier-ticket" className="hover:text-white transition-colors">Vérifier un ticket</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Paiements acceptés</h4>
            <div className="flex gap-3">
              <div className="bg-amber-400 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-lg">MTN MoMo</div>
              <div className="bg-orange-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg">Orange Money</div>
            </div>
            <p className="text-xs mt-4">Tirage certifié CSPRNG • 100% transparent</p>
          </div>
        </div>
        <div className="border-t border-primary-700 py-4 text-center text-xs text-primary-400">
          © {new Date().getFullYear()} TombolaXpress.cm — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}
