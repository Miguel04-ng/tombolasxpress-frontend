import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Spinner, ErrorMessage, SuccessMessage } from '@/components/common';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authService.demanderReset(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-icons-round text-primary-700 text-2xl">lock_reset</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
          <p className="text-gray-500 text-sm mt-1">Nous vous enverrons un lien par email</p>
        </div>
        {sent ? (
          <SuccessMessage message="Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.cm" className="input" required />
            </div>
            <ErrorMessage message={error} />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner size="sm" color="white" /> : <span className="material-icons-round">send</span>}
              Envoyer le lien
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-500 mt-5">
          <Link to="/auth/connexion" className="text-primary-600 hover:underline flex items-center justify-center gap-1">
            <span className="material-icons-round text-base">arrow_back</span>
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
