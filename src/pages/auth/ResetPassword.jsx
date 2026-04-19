// Reset password using token from URL
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { Spinner, ErrorMessage } from '@/components/common';

export default function ResetPassword() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token') || '';
  const [form, setForm] = useState({ nouveau_mot_de_passe: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.nouveau_mot_de_passe !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    try {
      await authService.resetPassword({ token, nouveau_mot_de_passe: form.nouveau_mot_de_passe });
      toast.success('Mot de passe réinitialisé !');
      navigate('/auth/connexion');
    } catch(err) {
      setError(err.response?.data?.message || 'Token invalide ou expiré.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-round text-primary-700 text-3xl">lock_reset</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h2>
          <p className="text-gray-500 text-sm mt-1">Choisissez un mot de passe sécurisé</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <input type="password" value={form.nouveau_mot_de_passe} onChange={e => setForm(f => ({ ...f, nouveau_mot_de_passe: e.target.value }))}
              className="input" placeholder="Minimum 8 caractères" minLength={8} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              className="input" placeholder="Répétez le mot de passe" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Spinner size="sm" color="white" /> : <><span className="material-icons-round text-base">lock</span>Réinitialiser</>}
          </button>
          <p className="text-center text-sm text-gray-500">
            <Link to="/auth/connexion" className="text-primary-600 font-medium hover:underline">Retour à la connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
