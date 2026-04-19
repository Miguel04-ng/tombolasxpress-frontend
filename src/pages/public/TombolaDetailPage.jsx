import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tombolaService } from '@/services/tombola.service';
import { ticketService }  from '@/services/index';
import AchatModal from '@/components/paiement/AchatModal';
import { PageLoader, EmptyState } from '@/components/common';
import { formatFCFA, formatDateTime, progressPct, statutBadge, maskName } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';

export default function TombolaDetailPage() {
  const { id }   = useParams();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [achatOpen, setAchatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const { data: tombolaData, isLoading } = useQuery({
    queryKey: ['tombola', id],
    queryFn:  () => tombolaService.detail(id),
    select:   (r) => r.data.data,
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey:  ['tickets-tombola', id],
    queryFn:   () => ticketService.ticketsTombola(id, { limit: 200 }),
    select:    (r) => r.data.data,
    enabled:   activeTab === 'tickets',
  });

  if (isLoading) return <PageLoader />;
  const tombola = tombolaData?.tombola;
  const tirage  = tombolaData?.tirage;
  if (!tombola) return <div className="text-center py-20 text-gray-400">Tombola introuvable.</div>;

  const pct        = progressPct(tombola.tickets_vendus, tombola.nombre_tickets);
  const badge      = statutBadge[tombola.statut];
  const disponibles = tombola.nombre_tickets - tombola.tickets_vendus;
  const canBuy     = tombola.statut === 'ouverte' && disponibles > 0;

  const handleAcheter = () => {
    if (!isAuthenticated) { navigate('/auth/connexion'); return; }
    setAchatOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
        <span className="material-icons-round text-xs">chevron_right</span>
        <span className="text-gray-700 font-medium truncate">{tombola.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Colonne gauche ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image principale */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden bg-primary-800 h-72 md:h-96">
            {tombola.photo_url ? (
              <img src={tombola.photo_url} alt={tombola.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="material-icons-round text-white/20 text-8xl">confirmation_number</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={badge.cls}>{badge.label}</span>
                {tombola.sponsor && <span className="badge bg-gold text-amber-900">Sponsorisé par {tombola.sponsor}</span>}
              </div>
              <h1 className="text-white text-xl md:text-3xl font-bold leading-tight">{tombola.titre}</h1>
            </div>
          </motion.div>

          {/* Photo remise si terminée */}
          {tombola.statut === 'terminee' && tombola.photo_remise_url && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <span className="material-icons-round text-gold-DEFAULT text-base">photo_camera</span>
                Remise du lot
              </p>
              <img src={tombola.photo_remise_url} alt="Remise du lot" className="w-full rounded-xl object-cover max-h-60" />
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-0 overflow-x-auto no-scrollbar">
              {[
                { id: 'info',    label: 'Description',      icon: 'info' },
                { id: 'tickets', label: 'Liste des tickets', icon: 'list' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <span className="material-icons-round text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'info' && (
            <div className="prose prose-sm max-w-none text-gray-700 animate-fade-in">
              <p className="leading-relaxed">{tombola.description}</p>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="animate-fade-in">
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                <span className="material-icons-round text-base text-green-500">verified</span>
                Liste publique — {tombola.tickets_vendus} tickets valides
              </p>
              {ticketsLoading ? <PageLoader /> : (
                ticketsData?.tickets?.length === 0 ? (
                  <EmptyState icon="confirmation_number" title="Aucun ticket vendu pour l'instant" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                    {ticketsData?.tickets?.map((t) => (
                      <div key={t.numero}
                        className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors
                          ${t.statut === 'gagnant'
                            ? 'bg-gold-light border-gold-DEFAULT text-amber-900 font-bold'
                            : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <p className="font-semibold">{t.numero}</p>
                        <p className="text-gray-400 truncate">{t.prenom} {t.nom}</p>
                        {t.statut === 'gagnant' && <p className="text-amber-600 font-bold">🏆 Gagnant !</p>}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ── Colonne droite ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Carte achat */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="card p-6 sticky top-24">
            <div className="text-center mb-5">
              <p className="text-gray-500 text-sm mb-1">Valeur du lot</p>
              <p className="text-3xl font-extrabold text-primary-700">{formatFCFA(tombola.valeur_lot)}</p>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { icon: 'confirmation_number', label: 'Prix par ticket', val: formatFCFA(tombola.prix_ticket), accent: true },
                { icon: 'inventory_2',         label: 'Tickets vendus',  val: `${tombola.tickets_vendus.toLocaleString('fr')} / ${tombola.nombre_tickets.toLocaleString('fr')}` },
                { icon: 'schedule',            label: 'Date du tirage',  val: formatDateTime(tombola.date_tirage) },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="material-icons-round text-base">{r.icon}</span>
                    {r.label}
                  </div>
                  <span className={`text-sm font-semibold ${r.accent ? 'text-accent text-base' : 'text-gray-900'}`}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Progression */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{tombola.tickets_vendus.toLocaleString('fr')} vendus</span>
                <span className="font-bold text-primary-600">{pct}%</span>
              </div>
              <div className="progress-bar h-3">
                <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-center mt-1.5 text-gray-400">
                {disponibles > 0 ? `${disponibles.toLocaleString('fr')} tickets restants` : 'Complet !'}
              </p>
              {tombola.seuil_atteint ? (
                <p className="text-xs text-center text-green-600 font-medium mt-1">✅ Seuil minimum atteint</p>
              ) : (
                <p className="text-xs text-center text-amber-600 mt-1">⚠️ Seuil min : {tombola.tickets_min}</p>
              )}
            </div>

            {/* Bouton */}
            {canBuy && (
              <button onClick={handleAcheter} className="btn-accent w-full py-3.5 text-base">
                <span className="material-icons-round">shopping_cart</span>
                Acheter mes tickets
              </button>
            )}
            {tombola.statut === 'terminee' && tirage && (
              <div className="bg-gold-light border border-gold-DEFAULT rounded-xl p-4 text-center">
                <p className="text-amber-800 font-bold mb-1">🏆 Tirage terminé</p>
                <p className="text-sm text-amber-700">Ticket gagnant : <strong>{tirage.numero_gagnant}</strong></p>
                <p className="text-sm text-amber-700">Gagnant : {tirage.prenom_masque} {tirage.nom}</p>
              </div>
            )}
            {tombola.statut === 'complete' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-sm text-blue-700">
                <span className="material-icons-round text-blue-500 text-2xl mb-1 block">hourglass_top</span>
                Tombola complète — Tirage imminent !
              </div>
            )}
            {tombola.statut === 'annulee' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-sm text-red-700">
                Tombola annulée. Les participants ont été remboursés.
              </div>
            )}

            {/* Paiements acceptés */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs text-gray-400">Paiements via</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded">MTN</span>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">Orange</span>
            </div>
          </motion.div>
        </div>
      </div>

      <AchatModal open={achatOpen} onClose={() => setAchatOpen(false)} tombola={tombola} />
    </div>
  );
}
