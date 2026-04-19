import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/index';
import { PageLoader, EmptyState, PageHeader } from '@/components/common';
import { formatDate, formatDateTime } from '@/utils/helpers';
import Icon from '@/components/common/Icon';

const STATUT_FILTER = [
  { val: '', label: 'Tous' },
  { val: 'valide',   label: 'Valides' },
  { val: 'gagnant',  label: '🏆 Gagnants' },
  { val: 'annule',   label: 'Annulés' },
];

export default function MesTicketsPage() {
  const [statutFilter, setStatutFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['mes-tickets', statutFilter],
    queryFn:  () => ticketService.mesTickets({ limit: 200, statut: statutFilter || undefined }),
    select:   (r) => r.data.data.tickets,
  });

  const tickets = data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="Mes tickets"
        subtitle={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} au total`}
        action={<Link to="/" className="btn-primary text-sm"><Icon name="add" className="text-base" />Acheter des tickets</Link>}
      />

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {STATUT_FILTER.map((f) => (
          <button key={f.val} onClick={() => setStatutFilter(f.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              statutFilter === f.val ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? <PageLoader /> : tickets.length === 0 ? (
        <EmptyState
          icon="confirmation_number"
          title="Aucun ticket trouvé"
          description="Participez à une tombola pour obtenir vos premiers tickets !"
          action={<Link to="/" className="btn-primary text-sm mt-2"><Icon name="confirmation_number" className="text-base" />Voir les tombolas</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <div key={t.id}
              className={`card p-5 relative transition-all ${
                t.statut === 'gagnant'
                  ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white'
                  : t.statut === 'annule'
                  ? 'opacity-60 border border-gray-200'
                  : 'border border-transparent hover:border-primary-200 hover:shadow-hover'
              }`}>

              {/* Statut badge */}
              <div className="absolute top-3 right-3">
                {t.statut === 'gagnant' && <span className="text-2xl">🏆</span>}
                {t.statut === 'valide' && <span className="badge badge-green">Valide</span>}
                {t.statut === 'annule' && <span className="badge badge-gray">Annulé</span>}
                {t.statut === 'en_attente' && <span className="badge badge-orange">En attente</span>}
              </div>

              {/* Numéro ticket */}
              <p className="font-mono font-extrabold text-primary-700 text-xl mb-1 pr-16">{t.numero}</p>
              <p className="text-xs text-gray-500 mb-4 truncate">{t.tombola_titre}</p>

              {/* Info */}
              <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Icon name="event" className="text-gray-300 text-sm" />
                  <span>Tirage : <strong className="text-gray-700">{formatDate(t.date_tirage)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="schedule" className="text-gray-300 text-sm" />
                  <span>Acheté le : {formatDate(t.created_at)}</span>
                </div>
              </div>

              {/* Barre tombola statut */}
              {t.tombola_statut === 'ouverte' && (
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Tirage en cours
                  </div>
                </div>
              )}
              {t.tombola_statut === 'terminee' && t.statut !== 'gagnant' && (
                <p className="text-xs text-gray-400 mt-2">Tombola terminée</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
