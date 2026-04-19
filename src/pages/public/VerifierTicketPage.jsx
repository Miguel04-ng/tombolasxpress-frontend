// src/pages/public/VerifierTicketPage.jsx
import { useState } from 'react';
import { ticketService } from '@/services/index';
import { formatDateTime, statutBadge } from '@/utils/helpers';
import { Spinner, ErrorMessage } from '@/components/common';

export default function VerifierTicketPage() {
  const [numero, setNumero]   = useState('');
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!numero.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await ticketService.verifier(numero.trim().toUpperCase());
      setResult(data.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Ticket introuvable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-round text-primary-700 text-3xl">verified</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Vérifier un ticket</h1>
        <p className="text-gray-500 text-sm">Entrez le numéro de ticket pour vérifier son authenticité</p>
      </div>
      <div className="card p-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de ticket</label>
            <input value={numero} onChange={(e) => setNumero(e.target.value.toUpperCase())}
              placeholder="TXP-2025-000042" className="input font-mono text-center text-lg tracking-wider" />
          </div>
          <ErrorMessage message={error} />
          <button type="submit" disabled={loading || !numero.trim()} className="btn-primary w-full py-3">
            {loading ? <Spinner size="sm" color="white" /> : <span className="material-icons-round">search</span>}
            Vérifier
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-5 rounded-xl border-2 animate-slide-up
            ${result.statut === 'gagnant' ? 'bg-gold-light border-gold-DEFAULT' : 'bg-green-50 border-green-200'}`}>
            {result.statut === 'gagnant' && (
              <div className="text-center mb-4">
                <span className="text-4xl">🏆</span>
                <p className="font-bold text-amber-800 text-lg mt-1">TICKET GAGNANT !</p>
              </div>
            )}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Numéro', val: <span className="font-mono font-bold">{result.numero}</span> },
                { label: 'Tombola', val: result.tombola_titre },
                { label: 'Statut ticket', val: <span className={`font-semibold ${result.statut === 'gagnant' ? 'text-amber-700' : 'text-green-700'}`}>{result.statut}</span> },
                { label: 'Propriétaire', val: `${result.prenom_masque} ${result.nom}` },
                { label: 'Date achat', val: formatDateTime(result.date_achat) },
              ].map((r, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="text-gray-900 font-medium text-right">{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
