import { Outlet, Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex flex-col">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon name="confirmation_number" className="text-white text-xl" />
          </div>
          <span className="text-white font-bold text-xl">
            Tombola<span className="text-gold-DEFAULT">Xpress</span>
          </span>
        </Link>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <p className="text-center text-primary-200 text-xs pb-6">
        © {new Date().getFullYear()} TombolaXpress.cm — Jeu sécurisé et transparent
      </p>
    </div>
  );
}
