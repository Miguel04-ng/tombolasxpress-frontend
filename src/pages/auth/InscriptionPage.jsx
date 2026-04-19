// src/pages/auth/InscriptionPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { Spinner, ErrorMessage } from '@/components/common';

export default function InscriptionPage() {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const [form, setForm]   = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authService.inscrire(form);
      login(data.data.token, data.data.user);
      toast.success('Compte créé avec succès ! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8 animate-slide-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
          <p className="text-gray-500 text-sm mt-1">Rejoignez TombolaXpress gratuitement</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
              <input value={form.prenom} onChange={upd('prenom')} placeholder="Jean" className="input py-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
              <input value={form.nom} onChange={upd('nom')} placeholder="Dupont" className="input py-2.5 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={upd('email')} placeholder="vous@exemple.cm" className="input py-2.5 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone Mobile Money</label>
            <input type="tel" value={form.telephone} onChange={upd('telephone')} placeholder="+237 6XX XXX XXX" className="input py-2.5 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.mot_de_passe} onChange={upd('mot_de_passe')}
                placeholder="8 caractères min." className="input py-2.5 text-sm pr-10" required minLength={8} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-icons-round text-base">{showPwd ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <ErrorMessage message={error} />
          <button type="submit" disabled={loading} className="btn-accent w-full py-3 mt-1">
            {loading ? <Spinner size="sm" color="white" /> : <span className="material-icons-round">person_add</span>}
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          Déjà un compte ?{' '}
          <Link to="/auth/connexion" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
