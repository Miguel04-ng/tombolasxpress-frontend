import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paiementService } from '@/services/index';
import { formatFCFA, operateurConfig } from '@/utils/helpers';
import { Modal, Spinner, ErrorMessage } from '@/components/common';

const STEPS = { FORM: 'form', PENDING: 'pending', SUCCESS: 'success', FAILED: 'failed' };
const POLL_INTERVAL = 4000;
const MAX_POLLS     = 30; // 2 minutes

export default function AchatModal({ open, onClose, tombola }) {
  const navigate = useNavigate();
  const [step, setStep]         = useState(STEPS.FORM);
  const [operateur, setOperateur] = useState('MTN');
  const [telephone, setTelephone] = useState('');
  const [nbTickets, setNbTickets] = useState(1);
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);
  const [paiementId, setPaiementId] = useState(null);
  const [pollCount, setPollCount]   = useState(0);
  const [countdown, setCountdown]   = useState(300); // 5 min

  const montant = tombola ? tombola.prix_ticket * nbTickets : 0;

  // Polling du statut de paiement
  const checkStatut = useCallback(async () => {
    if (!paiementId || step !== STEPS.PENDING) return;
    try {
      const { data } = await paiementService.statut(paiementId);
      const statut = data.data.paiement.statut;

      if (statut === 'confirme') {
        setStep(STEPS.SUCCESS);
        toast.success('🎉 Paiement confirmé ! Vos tickets ont été générés.');
      } else if (['echoue', 'expire'].includes(statut)) {
        setStep(STEPS.FAILED);
        setError('Le paiement a échoué ou expiré. Veuillez réessayer.');
      } else {
        setPollCount((c) => c + 1);
        if (pollCount >= MAX_POLLS) {
          setStep(STEPS.FAILED);
          setError('Délai d\'attente dépassé. Vérifiez l\'état de votre paiement dans "Mes paiements".');
        }
      }
    } catch {/* silencieux */ }
  }, [paiementId, step, pollCount]);

  useEffect(() => {
    if (step !== STEPS.PENDING) return;
    const interval = setInterval(checkStatut, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [step, checkStatut]);

  // Countdown 5 min
  useEffect(() => {
    if (step !== STEPS.PENDING) return;
    setCountdown(300);
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const reset = () => {
    setStep(STEPS.FORM);
    setError('');
    setPaiementId(null);
    setPollCount(0);
    setNbTickets(1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!telephone.match(/^\+?[0-9]{9,15}$/)) {
      setError('Numéro de téléphone invalide (format : +237XXXXXXXXX)');
      return;
    }
    setLoading(true);
    try {
      // 1. Créer la session
      const { data: sessionData } = await paiementService.creerSession({
        tombola_id:     tombola.id,
        nombre_tickets: nbTickets,
        operateur,
        telephone,
      });
      const { sessionId, tokenSession } = sessionData.data;

      // 2. Initier le paiement
      const { data: paiData } = await paiementService.initierPaiement({
        session_id:    sessionId,
        token_session: tokenSession,
      });
      setPaiementId(paiData.data.paiementId);
      setStep(STEPS.PENDING);
      toast(`📱 Confirmez le paiement de ${formatFCFA(montant)} sur votre ${operateur === 'MTN' ? 'MTN MoMo' : 'Orange Money'}`, { duration: 8000 });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'initiation du paiement.');
    } finally {
      setLoading(false);
    }
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  if (!tombola) return null;

  const disponibles = tombola.nombre_tickets - tombola.tickets_vendus;

  return (
    <Modal isOpen={open} onClose={handleClose} title="Acheter des tickets" size="md">
      {/* ── FORMULAIRE ────────────────────────────────────── */}
      {step === STEPS.FORM && (
        <div className="space-y-5">
          {/* Récap tombola */}
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
            {tombola.photo_url && (
              <img src={tombola.photo_url} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{tombola.titre}</p>
              <p className="text-primary-600 font-bold text-sm">{formatFCFA(tombola.prix_ticket)} / ticket</p>
              <p className="text-xs text-gray-500">{disponibles.toLocaleString('fr')} tickets restants</p>
            </div>
          </div>

          {/* Nombre de tickets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de tickets</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setNbTickets(Math.max(1, nbTickets - 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-400 transition-colors font-bold text-lg">−</button>
              <span className="flex-1 text-center text-2xl font-bold text-gray-900">{nbTickets}</span>
              <button onClick={() => setNbTickets(Math.min(Math.min(50, disponibles), nbTickets + 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-400 transition-colors font-bold text-lg">+</button>
            </div>
          </div>

          {/* Opérateur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Opérateur Mobile Money</label>
            <div className="grid grid-cols-2 gap-3">
              {['MTN', 'ORANGE'].map((op) => {
                const cfg = operateurConfig[op];
                const sel = operateur === op;
                return (
                  <button key={op} onClick={() => setOperateur(op)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${sel ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: cfg.color }}>
                      {op[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                    </div>
                    {sel && <span className="material-icons-round text-primary-500 text-base ml-auto">check_circle</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro {operateur === 'MTN' ? 'MTN MoMo' : 'Orange Money'}
            </label>
            <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
              placeholder="+237 6XX XXX XXX" className="input" />
            <p className="text-xs text-gray-400 mt-1">Numéro qui recevra la demande de paiement</p>
          </div>

          <ErrorMessage message={error} />

          {/* Récap montant */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-500">{nbTickets} ticket{nbTickets > 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-400">{formatFCFA(tombola.prix_ticket)} × {nbTickets}</p>
            </div>
            <p className="text-2xl font-bold text-primary-700">{formatFCFA(montant)}</p>
          </div>

          <button onClick={handleSubmit} disabled={loading || !telephone}
            className="btn-accent w-full py-3.5 text-base">
            {loading ? <Spinner size="sm" color="white" /> : <span className="material-icons-round">payments</span>}
            {loading ? 'Initiation…' : `Payer ${formatFCFA(montant)}`}
          </button>
        </div>
      )}

      {/* ── EN ATTENTE ────────────────────────────────────── */}
      {step === STEPS.PENDING && (
        <div className="text-center py-6 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: operateurConfig[operateur].bg }}>
            <span className="text-3xl">📱</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmation en attente</h3>
            <p className="text-gray-500 text-sm">
              Une demande de paiement de <strong>{formatFCFA(montant)}</strong> a été envoyée au numéro
            </p>
            <p className="text-primary-700 font-bold text-lg mt-1">{telephone}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">📲 Instructions</p>
            <p>Ouvrez votre application {operateurConfig[operateur].label} et confirmez le paiement avec votre code PIN.</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-gray-500">En attente de confirmation…</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-400">Expire dans </span>
            <span className={`text-sm font-bold ${countdown < 60 ? 'text-red-500' : 'text-gray-700'}`}>
              {mm}:{ss}
            </span>
          </div>
          <button onClick={handleClose} className="btn-ghost text-sm w-full">
            Je vérifierai dans "Mes paiements"
          </button>
        </div>
      )}

      {/* ── SUCCÈS ────────────────────────────────────────── */}
      {step === STEPS.SUCCESS && (
        <div className="text-center py-6 space-y-5">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <span className="material-icons-round text-green-500 text-4xl">check_circle</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Paiement confirmé ! 🎉</h3>
            <p className="text-gray-500 text-sm">{nbTickets} ticket{nbTickets > 1 ? 's ont été générés' : ' a été généré'} et envoyé{nbTickets > 1 ? 's' : ''} par SMS.</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700 font-medium">
              ✅ Vérifiez votre SMS pour vos numéros de tickets. Bonne chance !
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { handleClose(); navigate('/mes-tickets'); }}
              className="btn-primary flex-1 py-3 text-sm">
              <span className="material-icons-round text-base">confirmation_number</span>
              Voir mes tickets
            </button>
            <button onClick={handleClose} className="btn-outline flex-1 py-3 text-sm">Fermer</button>
          </div>
        </div>
      )}

      {/* ── ÉCHEC ─────────────────────────────────────────── */}
      {step === STEPS.FAILED && (
        <div className="text-center py-6 space-y-5">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="material-icons-round text-red-500 text-4xl">error_outline</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Paiement échoué</h3>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="btn-primary flex-1 py-3 text-sm">
              <span className="material-icons-round text-base">refresh</span>
              Réessayer
            </button>
            <button onClick={handleClose} className="btn-ghost flex-1 py-3 text-sm">Fermer</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
