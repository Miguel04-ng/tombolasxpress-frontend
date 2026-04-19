// src/pages/auth/ConnexionPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { Spinner, ErrorMessage } from '@/components/common';

export default function ConnexionPage() {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const [form, setForm]     = useState({ email: '', mot_de_passe: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authService.connecter(form);
      login(data.data.token, data.data.user);
      toast.success(`Bienvenue ${data.data.user.prenom} ! 👋`);
      navigate(data.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8 animate-slide-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="text-gray-500 text-sm mt-1">Accédez à votre espace TombolaXpress</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.cm" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.mot_de_passe}
                onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                placeholder="••••••••" className="input pr-10" required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-icons-round text-base">{showPwd ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link to="/auth/reset" className="text-xs text-primary-600 hover:underline">Mot de passe oublié ?</Link>
            </div>
          </div>
          <ErrorMessage message={error} />
          <button type="submit" disabled={loading} className="btn-accent w-full py-3">
            {loading ? <Spinner size="sm" color="white" /> : <span className="material-icons-round">login</span>}
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/auth/inscription" className="text-primary-600 font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
