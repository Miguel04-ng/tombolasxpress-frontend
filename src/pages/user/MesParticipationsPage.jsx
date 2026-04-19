// src/pages/user/MesParticipationsPage.jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { utilisateurService } from '@/services/index';
import { PageLoader, EmptyState, PageHeader } from '@/components/common';
import { formatDate, statutBadge } from '@/utils/helpers';

export default function MesParticipationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['mes-participations'],
    queryFn:  () => utilisateurService.mesParticipations(),
    select:   (r) => r.data.data.participations,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <PageHeader title="Mes participations" subtitle="Toutes les tombolas auxquelles vous avez participé" />
      {isLoading ? <PageLoader /> : !data?.length ? (
        <EmptyState icon="history" title="Aucune participation"
          action={<Link to="/" className="btn-primary text-sm">Découvrir les tombolas</Link>} />
      ) : (
        <div className="space-y-3">
          {data.map((p) => {
            const badge = statutBadge[p.statut] || {};
            return (
              <Link key={p.id} to={`/tombolas/${p.id}`} className="card p-5 flex items-center gap-4 hover:shadow-hover transition-shadow block">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full"><span className="material-icons-round text-gray-400 text-2xl">confirmation_number</span></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{p.titre}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{p.nb_tickets} ticket{p.nb_tickets > 1 ? 's' : ''} • Tirage : {formatDate(p.date_tirage)}</p>
                </div>
                <div className="shrink-0">
                  {p.est_gagnant ? (
                    <span className="badge-gold text-sm">🏆 Gagné !</span>
                  ) : (
                    <span className={badge.cls}>{badge.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
