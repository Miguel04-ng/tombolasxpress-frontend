// src/pages/user/NotificationsPage.jsx
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/index';
import { PageLoader, EmptyState, PageHeader } from '@/components/common';
import { fromNow } from '@/utils/helpers';

const TYPE_ICON = {
  ticket_confirme: { icon: 'check_circle', color: 'text-green-500' },
  paiement_echoue: { icon: 'error',        color: 'text-red-500' },
  tirage_bientot:  { icon: 'schedule',     color: 'text-blue-500' },
  gagnant:         { icon: 'emoji_events', color: 'text-amber-500' },
  remboursement:   { icon: 'account_balance_wallet', color: 'text-purple-500' },
};

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationService.mesNotifications({ limit: 50 }),
    select:   (r) => r.data.data.notifications,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <PageHeader title="Notifications" />
      {isLoading ? <PageLoader /> : !data?.length ? (
        <EmptyState icon="notifications_none" title="Aucune notification" desc="Vos notifications apparaîtront ici." />
      ) : (
        <div className="space-y-2">
          {data.map((n) => {
            const cfg = TYPE_ICON[n.type] || { icon: 'info', color: 'text-gray-500' };
            return (
              <div key={n.id} className="card p-4 flex items-start gap-3">
                <span className={`material-icons-round ${cfg.color} text-xl shrink-0 mt-0.5`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-gray-400">{fromNow(n.created_at)}</p>
                    <span className={`text-xs font-medium ${n.statut === 'envoye' ? 'text-green-600' : n.statut === 'echec' ? 'text-red-500' : 'text-orange-500'}`}>
                      {n.canal.toUpperCase()} • {n.statut}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
