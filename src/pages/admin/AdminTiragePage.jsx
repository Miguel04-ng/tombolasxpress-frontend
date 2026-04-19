import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { tombolaService } from '@/services/tombola.service';
import { tirageService } from '@/services/index';
import { formatFCFA, formatDate, progressPct } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';
import Icon from '@/components/common/Icon';

export default function AdminTiragePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmed, setConfirmed]     = useState(false);
  const [tirageResult, setTirageResult] = useState(null);
  const [annulerMode, setAnnulerMode] = useState(false);

  const { data: resp, isLoading } = useQuery({
    queryKey: ['tombola-admin', id],
    queryFn:  () => tombolaService.detail(id),
    select:   (r) => r.data.data,
  });
  const tombola = resp?.tombola;

  const tirageMutation = useMutation({
    mutationFn: () => tirageService.lancer(id, 'manuel'),
    onSuccess: (r) => {
      setTirageResult(r.data.data);
      toast.success('🏆 Tirage effectué avec succès !');
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || 'Erreur lors du tirage');
      setConfirmed(false);
    },
  });

  const annulerMutation = useMutation({
    mutationFn: () => tirageService.annuler(id),
    onSuccess: () => {
      toast.success('Tombola annulée. Remboursements en cours.');
      navigate('/admin/tombolas');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!tombola) return <div className="text-center py-20 text-gray-500">Tombola introuvable.</div>;

  const pct        = progressPct(tombola.tickets_vendus, tombola.nombre_tickets);
  const seuilOk    = tombola.tickets_vendus >= tombola.tickets_min;
  const canDraw    = ['ouverte', 'complete'].includes(tombola.statut) && seuilOk;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/admin/tombolas" className="btn-ghost text-sm inline-flex">
        <Icon name="arrow_back" className="text-base" />Retour aux tombolas
      </Link>

      {/* Info tombola */}
      <div className="card overflow-hidden">
        {tombola.photo_url && (
          <div className="h-40 bg-gray-100 overflow-hidden">
            <img src={tombola.photo_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{tombola.titre}</h1>
          <p className="text-gray-500 text-sm mb-4">{tombola.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-5">
            {[
              { label: 'Prix ticket',     value: formatFCFA(tombola.prix_ticket) },
              { label: 'Valeur du lot',   value: formatFCFA(tombola.valeur_lot) },
              { label: 'Tickets vendus',  value: `${tombola.tickets_vendus} / ${tombola.nombre_tickets}` },
              { label: 'Seuil minimum',   value: `${tombola.tickets_min} tickets (80%)` },
              { label: 'Date prévue',     value: formatDate(tombola.date_tirage) },
              { label: 'Collecte actuelle', value: formatFCFA(tombola.tickets_vendus * tombola.prix_ticket) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          {/* Progression */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression des ventes</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${seuilOk ? '' : 'opacity-50'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
          {seuilOk ? (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-3">
              <Icon name="check_circle" className="text-base" />Seuil minimum atteint — tirage autorisé
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-500 text-sm mt-3">
              <Icon name="warning" className="text-base" />
              Seuil non atteint ({tombola.tickets_vendus}/{tombola.tickets_min}) — tirage bloqué
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Pas encore lancé ── */}
        {!tirageResult && (
          <motion.div key="pre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Lancer le tirage</h2>

              {!canDraw ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                  <Icon name="warning" className="text-orange-400 text-3xl mb-2" />
                  <p className="font-semibold text-orange-700">Tirage impossible</p>
                  <p className="text-orange-600 text-sm mt-1">
                    {tombola.statut === 'terminee' ? 'Ce tirage a déjà été effectué.' :
                     tombola.statut === 'annulee' ? 'Cette tombola est annulée.' :
                     `Le seuil minimum de ${tombola.tickets_min} tickets n'est pas encore atteint.`}
                  </p>
                </div>
              ) : !confirmed ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex gap-3">
                      <Icon name="warning" className="text-amber-500 text-xl shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Action irréversible</p>
                        <p className="text-amber-700 text-sm mt-1">
                          Le tirage va sélectionner aléatoirement 1 ticket parmi
                          <strong> {tombola.tickets_vendus} tickets valides</strong> via l'algorithme CSPRNG.
                          Le gagnant sera notifié par SMS immédiatement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input type="checkbox" id="confirm-check" className="w-5 h-5 accent-primary-700" onChange={(e) => setConfirmed(e.target.checked)} />
                    <label htmlFor="confirm-check" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Je confirme vouloir lancer le tirage officiel pour la tombola "<strong>{tombola.titre}</strong>"
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Icon name="check_circle" className="text-green-500 text-xl" />
                    <p className="text-green-700 text-sm font-medium">Confirmation reçue. Prêt à lancer.</p>
                  </div>
                  <button onClick={() => tirageMutation.mutate()}
                    disabled={tirageMutation.isPending}
                    className="btn-accent w-full py-4 text-base font-bold">
                    {tirageMutation.isPending ? (
                      <><Spinner size="sm" color="white" />Tirage en cours…</>
                    ) : (
                      <><Icon name="casino" className="text-xl" />🎲 Lancer le tirage officiel</>
                    )}
                  </button>
                  <button onClick={() => setConfirmed(false)} className="btn-ghost w-full text-sm">
                    Annuler
                  </button>
                </div>
              )}
            </div>

            {/* Annuler tombola */}
            {canDraw && (
              <div className="card p-5 border-red-200 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Annuler la tombola</p>
                    <p className="text-xs text-gray-400 mt-0.5">Remboursement automatique de tous les participants</p>
                  </div>
                  {!annulerMode ? (
                    <button onClick={() => setAnnulerMode(true)} className="btn-ghost text-red-500 text-sm">
                      <Icon name="cancel" className="text-base" />Annuler
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => annulerMutation.mutate()}
                        disabled={annulerMutation.isPending}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600">
                        {annulerMutation.isPending ? <Spinner size="sm" color="white" /> : 'Confirmer l\'annulation'}
                      </button>
                      <button onClick={() => setAnnulerMode(false)} className="btn-ghost text-xs">Non</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Résultat du tirage ── */}
        {tirageResult && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                className="text-6xl mb-4">🏆</motion.div>
              <h2 className="text-2xl font-extrabold text-primary-700 mb-1">Tirage effectué !</h2>
              <p className="text-gray-500 mb-6">Gagnant sélectionné parmi {tirageResult.nbTicketsEligibles} tickets valides</p>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 mb-6">
                <p className="text-xs text-amber-600 uppercase font-bold mb-2">Ticket gagnant</p>
                <p className="text-3xl font-extrabold text-amber-800 mb-3">{tirageResult.ticketGagnant}</p>
                <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  {tirageResult.gagnant?.prenom?.[0]?.toUpperCase()}
                </div>
                <p className="font-bold text-gray-800">{tirageResult.gagnant?.prenom} {tirageResult.gagnant?.nom}</p>
                <p className="text-sm text-gray-500">{tirageResult.gagnant?.telephone}</p>
              </div>

              <p className="text-sm text-green-600 flex items-center justify-center gap-1 mb-6">
                <Icon name="sms" className="text-base" />SMS de notification envoyé au gagnant
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/admin/tombolas" className="btn-primary">
                  <Icon name="list" className="text-base" />Retour aux tombolas
                </Link>
                <Link to="/gagnants" className="btn-outline">
                  <Icon name="emoji_events" className="text-base" />Voir les gagnants
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
