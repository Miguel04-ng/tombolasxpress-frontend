import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tombolaService } from '@/services/tombola.service';
import { ticketService } from '@/services/index';
import { PageLoader, EmptyState, Modal } from '@/components/common';
import AchatModal from '@/components/paiement/AchatModal';
import useAuthStore from '@/store/authStore';
import {
  formatFCFA, formatDateTime, progressPct,
  statutBadge, maskName,
} from '@/utils/helpers';

export default function TombolaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showAchat, setShowAchat] = useState(false);
  const [ticketsPage, setTicketsPage] = useState(1);

  const { data: tombolaData, isLoading, refetch } = useQuery({
    queryKey:  ['tombola', id],
    queryFn:   () => tombolaService.detail(id),
    select:    r => r.data.data,
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets-tombola', id, ticketsPage],
    queryFn:  () => ticketService.ticketsTombola(id, { page: ticketsPage, limit: 50 }),
    select:   r => r.data.data,
    enabled:  !!tombolaData,
  });

  if (isLoading) return <PageLoader />;

  const tombola = tombolaData?.tombola;
  const tirage  = tombolaData?.tirage;
  if (!tombola) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <EmptyState icon="search_off" title="Tombola introuvable" desc="Cette tombola n'existe pas ou a été supprimée."
        action={<Link to="/" className="btn-primary">Retour à l'accueil</Link>} />
    </div>
  );

  const pct    = progressPct(tombola.tickets_vendus, tombola.nombre_tickets);
  const badge  = statutBadge[tombola.statut] || {};
  const almost = tombola.tickets_restants <= tombola.nombre_tickets * 0.1 && tombola.statut === 'ouverte';

  const handleParticiper = () => {
    if (!isAuthenticated) {
      navigate('/auth/connexion', { state: { from: `/tombolas/${id}` } });
      return;
    }
    setShowAchat(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-700 transition-colors">Tombolas</Link>
        <span className="material-icons-round text-sm">chevron_right</span>
        <span className="text-gray-800 font-medium truncate">{tombola.titre}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Colonne gauche : image + info ────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-800 to-primary-600 aspect-video">
            {tombola.photo_url ? (
              <img src={tombola.photo_url} alt={tombola.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="material-icons-round text-white/20 text-9xl">confirmation_number</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={badge.cls}>{badge.label}</span>
              {almost && <span className="badge bg-accent text-white animate-pulse-slow">
                <span className="material-icons-round text-xs">local_fire_department</span>Presque complet !
              </span>}
              {tombola.sponsor && <span className="badge-gold">
                <span className="material-icons-round text-xs">stars</span>Sponsorisé par {tombola.sponsor}
              </span>}
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="bg-black/70 backdrop-blur text-white font-bold text-xl px-4 py-2 rounded-xl">
                {formatFCFA(tombola.valeur_lot)}
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{tombola.titre}</h1>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tombola.description}</p>
          </div>

          {/* Gagnant (si terminée) */}
          {tombola.statut === 'terminee' && tirage && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card p-6 border-2 border-gold-DEFAULT bg-gradient-to-br from-amber-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold-DEFAULT rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-icons-round text-white text-2xl">emoji_events</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg">🏆 Gagnant du tirage !</h3>
                  <p className="text-amber-700 text-sm">{formatDateTime(tirage.date_tirage)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <p className="text-3xl font-extrabold text-accent text-center mb-1">{tirage.numero_gagnant}</p>
                <p className="text-center text-gray-600">{maskName(tirage.prenom_masque, tirage.nom)}</p>
              </div>
              {tombola.photo_remise_url && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img src={tombola.photo_remise_url} alt="Remise du lot" className="w-full object-cover max-h-64" />
                </div>
              )}
            </motion.div>
          )}

          {/* Liste publique des tickets */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-icons-round text-primary-600">list_alt</span>
                Tickets vendus ({ticketsData?.pagination?.total || 0})
              </h3>
              <span className="badge-blue">Transparence totale</span>
            </div>
            {ticketsLoading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : ticketsData?.tickets?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Aucun ticket vendu pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {ticketsData?.tickets?.map((t) => (
                  <div key={t.numero}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors
                      ${t.statut === 'gagnant'
                        ? 'bg-gold-light border-gold-DEFAULT text-amber-800 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <p className="font-semibold">{t.numero}</p>
                    <p className="text-gray-400 truncate">{t.prenom} {t.nom}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Colonne droite : achat ────────────────────────── */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">

            {/* Prix & progression */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Prix du ticket</p>
                  <p className="text-3xl font-extrabold text-accent">{formatFCFA(tombola.prix_ticket)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tirage le</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDateTime(tombola.date_tirage)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{tombola.tickets_vendus.toLocaleString('fr')} tickets vendus</span>
                  <span className="font-bold text-primary-600">{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {tombola.tickets_restants?.toLocaleString('fr')} restants / {tombola.nombre_tickets.toLocaleString('fr')} total
                </p>
              </div>

              {/* Seuil minimum */}
              {tombola.statut === 'ouverte' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs mb-4">
                  <span className="material-icons-round text-base shrink-0">info</span>
                  Tirage garanti dès {Math.round(tombola.tickets_min / tombola.nombre_tickets * 100)}% vendus
                  ({tombola.tickets_min.toLocaleString('fr')} tickets minimum)
                </div>
              )}

              {/* Bouton achat */}
              {tombola.statut === 'ouverte' ? (
                <button onClick={handleParticiper} className="btn-accent w-full py-3.5 text-base">
                  <span className="material-icons-round">shopping_cart</span>
                  Acheter mes tickets
                </button>
              ) : tombola.statut === 'terminee' ? (
                <div className="w-full py-3.5 text-center bg-gray-100 text-gray-500 rounded-xl font-medium text-sm">
                  <span className="material-icons-round text-base align-middle mr-1">lock</span>
                  Tirage terminé
                </div>
              ) : (
                <div className="w-full py-3.5 text-center bg-orange-50 text-orange-600 rounded-xl font-medium text-sm">
                  Tombola {badge.label}
                </div>
              )}

              {!isAuthenticated && tombola.statut === 'ouverte' && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Vous devez <Link to="/auth/connexion" className="text-primary-600 underline">vous connecter</Link> pour participer
                </p>
              )}
            </motion.div>

            {/* Paiements acceptés */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Paiements acceptés</p>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <div className="w-4 h-4 bg-amber-400 rounded-full shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">MTN MoMo</p>
                    <p className="text-xs text-amber-600">Push automatique</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                  <div className="w-4 h-4 bg-orange-500 rounded-full shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-orange-900">Orange Money</p>
                    <p className="text-xs text-orange-600">WebPay sécurisé</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Garanties */}
            <div className="card p-4 space-y-3">
              {[
                { icon: 'verified_user', text: 'Tirage 100% certifié (CSPRNG)', color: 'text-green-600' },
                { icon: 'receipt_long',  text: 'Ticket unique numéroté', color: 'text-blue-600' },
                { icon: 'undo',          text: 'Remboursement si annulation', color: 'text-orange-600' },
                { icon: 'sms',           text: 'Notification SMS instantanée', color: 'text-purple-600' },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className={`material-icons-round text-base ${g.color}`}>{g.icon}</span>
                  {g.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'achat */}
      <AchatModal
        open={showAchat}
        onClose={() => setShowAchat(false)}
        tombola={tombola}
        onSuccess={() => { setShowAchat(false); refetch(); }}
      />
    </div>
  );
}
