import { useQuery } from '@tanstack/react-query';
import { paiementService } from '@/services/index';
import { PageLoader, EmptyState, PageHeader } from '@/components/common';
import { formatFCFA, formatDateTime, paiementBadge, operateurConfig } from '@/utils/helpers';
import Icon from '@/components/common/Icon';

export default function MesPaiementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['mes-paiements'],
    queryFn:  () => paiementService.mesPaiements({ limit: 100 }),
    select:   (r) => r.data.data.paiements,
  });

  const paiements = data || [];
  const total = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.montant, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <PageHeader title="Mes paiements" subtitle="Historique de toutes vos transactions" />

      {/* Résumé */}
      {!isLoading && paiements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total dépensé',    value: formatFCFA(total),    icon: 'account_balance_wallet', color: 'text-primary-700' },
            { label: 'Paiements confirmés', value: paiements.filter(p => p.statut === 'confirme').length, icon: 'check_circle', color: 'text-green-600' },
            { label: 'En attente',        value: paiements.filter(p => p.statut === 'en_attente').length, icon: 'pending', color: 'text-orange-500' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <Icon name={icon} className={`${color} text-base`} />
                <p className={`font-bold text-lg ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? <PageLoader /> : paiements.length === 0 ? (
        <EmptyState icon="payments" title="Aucun paiement"
          description="Vos transactions apparaîtront ici après votre premier achat de tickets." />
      ) : (
        <div className="space-y-3">
          {paiements.map((p) => {
            const badge = paiementBadge[p.statut] || {};
            const opCfg = operateurConfig[p.operateur] || {};
            return (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                {/* Opérateur icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-center leading-tight"
                  style={{ backgroundColor: opCfg.bg || '#f5f5f5', color: opCfg.color || '#333' }}>
                  {p.operateur === 'MTN' ? 'MTN' : 'OM'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.tombola_titre}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-400">
                    <span>{p.nombre_tickets} ticket{p.nombre_tickets > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{opCfg.label || p.operateur}</span>
                    <span>•</span>
                    <span>{formatDateTime(p.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{formatFCFA(p.montant)}</p>
                  <span className={badge.cls || 'badge badge-gray'}>{badge.label || p.statut}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
