import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { tombolaService } from '@/services/tombola.service';
import { paiementService } from '@/services/index';
import { formatFCFA, formatDate } from '@/utils/helpers';
import { Spinner } from '@/components/common';
import Icon from '@/components/common/Icon';

const STEPS = ['Choix', 'Opérateur', 'Confirmation', 'Résultat'];

export default function PaiementPage() {
  const { tombolaId } = useParams();
  const navigate = useNavigate();
  const [step, setStep]               = useState(0);
  const [nbTickets, setNbTickets]     = useState(1);
  const [operateur, setOperateur]     = useState('');
  const [telephone, setTelephone]     = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [paiementId, setPaiementId]   = useState(null);
  const [paiementStatut, setPaiementStatut] = useState(null);
  const pollingRef = useRef(null);

  const { data: tombolaResp, isLoading } = useQuery({
    queryKey: ['tombola', tombolaId],
    queryFn:  () => tombolaService.detail(tombolaId),
    select:   (r) => r.data.data,
  });
  const tombola = tombolaResp?.tombola;

  // Nettoyage polling
  useEffect(() => () => clearInterval(pollingRef.current), []);

  // ── Étape 1 → 2 : Créer session ───────────────────────────
  const sessionMutation = useMutation({
    mutationFn: () => paiementService.creerSession({ tombola_id: parseInt(tombolaId), nombre_tickets: nbTickets, operateur, telephone }),
    onSuccess: (r) => { setSessionData(r.data.data); setStep(2); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Erreur lors de la création de la session'),
  });

  // ── Étape 2 → 3 : Initier paiement ────────────────────────
  const initierMutation = useMutation({
    mutationFn: () => paiementService.initierPaiement({ session_id: sessionData.sessionId, token_session: sessionData.tokenSession }),
    onSuccess: (r) => {
      setPaiementId(r.data.data.paiementId);
      setStep(3);
      startPolling(r.data.data.paiementId);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur lors du paiement'),
  });

  const startPolling = (id) => {
    pollingRef.current = setInterval(async () => {
      try {
        const r = await paiementService.statut(id);
        const s = r.data.data.paiement.statut;
        if (s === 'confirme') {
          clearInterval(pollingRef.current);
          setPaiementStatut('confirme');
          toast.success('🎉 Paiement confirmé ! Vos tickets ont été générés.');
        } else if (['echoue', 'expire'].includes(s)) {
          clearInterval(pollingRef.current);
          setPaiementStatut(s);
        }
      } catch { clearInterval(pollingRef.current); }
    }, 4000);
    // Stop après 6 min
    setTimeout(() => clearInterval(pollingRef.current), 360000);
  };

  const montant = tombola ? tombola.prix_ticket * nbTickets : 0;

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!tombola)  return <div className="text-center py-20 text-gray-500">Tombola introuvable.</div>;
  if (tombola.statut !== 'ouverte') return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Tombola non disponible</h2>
      <p className="text-gray-500 mb-6">Cette tombola n'est plus ouverte aux participations.</p>
      <Link to="/" className="btn-primary">Voir d'autres tombolas</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === step ? 'bg-primary-700 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? <Icon name="check_circle" className="text-sm" /> : <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 shrink-0 rounded ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Résumé tombola */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-50 rounded-xl overflow-hidden shrink-0">
          {tombola.photo_url ? <img src={tombola.photo_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Icon name="emoji_events" className="text-primary-300 text-2xl" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-sm truncate">{tombola.titre}</h2>
          <p className="text-xs text-gray-500">Tirage le {formatDate(tombola.date_tirage)}</p>
          <p className="text-xs text-gray-500">{tombola.tickets_restants} tickets restants</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400">Prix/ticket</p>
          <p className="font-bold text-primary-700">{formatFCFA(tombola.prix_ticket)}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 0 : Choix du nombre de tickets ── */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Combien de tickets ?</h3>
              <div className="flex items-center justify-center gap-6 mb-8">
                <button onClick={() => setNbTickets(Math.max(1, nbTickets - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-bold">−</button>
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-primary-700">{nbTickets}</p>
                  <p className="text-sm text-gray-400 mt-1">ticket{nbTickets > 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setNbTickets(Math.min(50, nbTickets + 1))}
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-bold">+</button>
              </div>
              {/* Raccourcis */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {[1, 2, 5, 10].map((n) => (
                  <button key={n} onClick={() => setNbTickets(n)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${nbTickets === n ? 'border-primary-700 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {n} ticket{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <div className="bg-primary-50 rounded-xl p-4 flex justify-between items-center mb-6">
                <p className="text-sm font-medium text-gray-700">Total à payer</p>
                <p className="text-xl font-extrabold text-primary-700">{formatFCFA(montant)}</p>
              </div>
              <button onClick={() => setStep(1)} className="btn-accent w-full py-3.5 text-base">
                <Icon name="arrow_forward" className="text-base" />Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1 : Choix opérateur + téléphone ── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Moyen de paiement</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { op: 'MTN',    label: 'MTN MoMo',      bg: 'bg-amber-50',  border: 'border-amber-300',  active: 'bg-amber-400', dot: 'bg-amber-400',  text: 'text-amber-800' },
                  { op: 'ORANGE', label: 'Orange Money',  bg: 'bg-orange-50', border: 'border-orange-300', active: 'bg-orange-500', dot: 'bg-orange-500', text: 'text-orange-800' },
                ].map(({ op, label, bg, border, active, dot, text }) => (
                  <button key={op} onClick={() => setOperateur(op)}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-center ${operateur === op ? `${bg} ${border} ring-2 ring-offset-2 ring-${op === 'MTN' ? 'amber' : 'orange'}-400` : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 ${active} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                      <Icon name="payments" className="text-white text-xl" />
                    </div>
                    <p className={`font-bold text-sm ${text}`}>{label}</p>
                    {operateur === op && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Icon name="check" className="text-white text-xs" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Numéro {operateur || 'Mobile Money'}
                </label>
                <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+237 6XX XXX XXX" className="input text-lg" />
                <p className="text-xs text-gray-400 mt-1.5">
                  <Icon name="info" className="text-xs inline mr-1" />
                  Une demande de paiement sera envoyée à ce numéro
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between mb-6">
                <span className="text-sm text-gray-600">{nbTickets} ticket{nbTickets > 1 ? 's' : ''}</span>
                <span className="font-bold text-primary-700">{formatFCFA(montant)}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1">
                  <Icon name="arrow_back" className="text-base" />Retour
                </button>
                <button onClick={() => sessionMutation.mutate()}
                  disabled={!operateur || !telephone || sessionMutation.isPending}
                  className="btn-accent flex-1 py-3">
                  {sessionMutation.isPending ? <Spinner size="sm" color="white" /> : <Icon name="arrow_forward" className="text-base" />}
                  Continuer
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2 : Confirmation avant push MoMo ── */}
        {step === 2 && sessionData && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Récapitulatif de commande</h3>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Tombola',    value: tombola.titre },
                  { label: 'Tickets',   value: `${nbTickets} ticket${nbTickets > 1 ? 's' : ''}` },
                  { label: 'Opérateur', value: operateur === 'MTN' ? 'MTN Mobile Money' : 'Orange Money' },
                  { label: 'Numéro',    value: telephone },
                  { label: 'Montant',   value: formatFCFA(sessionData.montant), bold: true },
                ].map(({ label, value, bold }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm ${bold ? 'font-extrabold text-primary-700 text-base' : 'font-semibold text-gray-900'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                <Icon name="info" className="text-amber-500 shrink-0 text-xl mt-0.5" />
                <p className="text-sm text-amber-700">
                  Après confirmation, vous recevrez une notification push sur votre téléphone.
                  Entrez votre <strong>code PIN {operateur}</strong> pour valider. Délai : 5 minutes.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                  <Icon name="arrow_back" className="text-base" />Retour
                </button>
                <button onClick={() => initierMutation.mutate()}
                  disabled={initierMutation.isPending}
                  className="btn-accent flex-1 py-3">
                  {initierMutation.isPending ? <Spinner size="sm" color="white" /> : <Icon name="send_to_mobile" className="text-base" />}
                  Payer {formatFCFA(montant)}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 3 : En attente du webhook / confirmation ── */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card p-8 text-center">
              {!paiementStatut && (
                <>
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="w-full h-full rounded-full border-4 border-primary-100 flex items-center justify-center">
                      <Icon name="phone_iphone" className="text-primary-700 text-4xl" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary-700 border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">En attente de confirmation</h3>
                  <p className="text-gray-500 mb-1">Vérifiez votre téléphone <strong>{telephone}</strong></p>
                  <p className="text-sm text-gray-400 mb-6">
                    Entrez votre code PIN {operateur === 'MTN' ? 'MTN MoMo' : 'Orange Money'} pour confirmer
                  </p>
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm">
                    <Icon name="timer" className="text-base" />Expire dans 5 minutes
                  </div>
                </>
              )}
              {paiementStatut === 'confirme' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon name="check_circle" className="text-green-500 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-green-700 mb-2">Paiement confirmé ! 🎉</h3>
                  <p className="text-gray-500 mb-2">Vos tickets ont été générés et envoyés par SMS.</p>
                  <p className="text-sm text-gray-400 mb-8">Vous recevrez une notification dès les résultats.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/mes-tickets" className="btn-primary">
                      <Icon name="confirmation_number" className="text-base" />Voir mes tickets
                    </Link>
                    <Link to="/" className="btn-outline">Autres tombolas</Link>
                  </div>
                </motion.div>
              )}
              {(paiementStatut === 'echoue' || paiementStatut === 'expire') && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon name="cancel" className="text-red-500 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    {paiementStatut === 'expire' ? 'Délai expiré' : 'Paiement échoué'}
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {paiementStatut === 'expire' ? 'Vous n\'avez pas confirmé à temps.' : 'Le paiement n\'a pas pu être traité.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => { setStep(1); setPaiementStatut(null); setSessionData(null); }} className="btn-primary">
                      <Icon name="refresh" className="text-base" />Réessayer
                    </button>
                    <Link to="/" className="btn-ghost">Retour à l'accueil</Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
