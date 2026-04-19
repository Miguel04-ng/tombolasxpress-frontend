// src/pages/user/DashboardPage.jsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { utilisateurService, notificationService, ticketService } from '@/services/index';
import useAuthStore from '@/store/authStore';
import { StatCard, PageLoader, EmptyState } from '@/components/common';
import { formatDate, formatFCFA, statutBadge } from '@/utils/helpers';
import TombolaCard from '@/components/tombola/TombolaCard';
import { tombolaService } from '@/services/tombola.service';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: tombolas } = useQuery({
    queryKey: ['tombolas-actives'],
    queryFn:  () => tombolaService.lister({ statut: 'ouverte', limit: 4 }),
    select:   (r) => r.data.data.tombolas,
  });

  const { data: participations } = useQuery({
    queryKey: ['mes-participations'],
    queryFn:  () => utilisateurService.mesParticipations(),
    select:   (r) => r.data.data.participations,
  });

  const { data: tickets } = useQuery({
    queryKey: ['mes-tickets-count'],
    queryFn:  () => ticketService.mesTickets({ limit: 1 }),
    select:   (r) => r.data.data,
  });

  const nbTickets    = tickets?.tickets?.length || 0;
  const nbPart       = participations?.length || 0;
  const nbGagnant    = participations?.filter((p) => p.est_gagnant)?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm mb-0.5">Bon retour,</p>
            <h1 className="text-2xl font-bold">{user?.prenom} {user?.nom} 👋</h1>
            <p className="text-primary-200 text-sm mt-1">{user?.telephone}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🎟️</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="confirmation_number" label="Tickets achetés"    value={nbTickets}  color="blue" />
        <StatCard icon="history"             label="Participations"      value={nbPart}     color="green" />
        <StatCard icon="emoji_events"        label="Tombolas gagnées"   value={nbGagnant}  color="gold" />
        <StatCard icon="notifications"       label="Notifications"       value="—"          color="orange" />
      </div>

      {/* Tombolas actives */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Tombolas en cours</h2>
          <Link to="/" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Voir tout <span className="material-icons-round text-base">chevron_right</span>
          </Link>
        </div>
        {!tombolas ? <PageLoader /> : tombolas.length === 0 ? (
          <EmptyState icon="confirmation_number" title="Aucune tombola active" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {tombolas.map((t, i) => <TombolaCard key={t.id} tombola={t} index={i} />)}
          </div>
        )}
      </div>

      {/* Mes participations récentes */}
      {participations?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Mes participations récentes</h2>
            <Link to="/participations" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {participations.slice(0, 4).map((p) => {
              const badge = statutBadge[p.statut] || {};
              return (
                <div key={p.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center h-full"><span className="material-icons-round text-gray-400">confirmation_number</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.titre}</p>
                    <p className="text-xs text-gray-500">{p.nb_tickets} ticket{p.nb_tickets > 1 ? 's' : ''} • {formatDate(p.date_tirage)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.est_gagnant ? <span className="badge-gold">🏆 Gagné</span> : <span className={badge.cls}>{badge.label}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
