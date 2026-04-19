import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService } from '@/services/index';
import { formatFCFA, formatDate, statutBadge } from '@/utils/helpers';
import StatCard from '@/components/common/StatCard';
import Icon from '@/components/common/Icon';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  () => adminService.dashboard(),
    select:   (r) => r.data.data,
    refetchInterval: 30000, // Auto-refresh toutes les 30s
  });

  const stats = data?.stats;
  const tombolas = data?.tombolas || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue globale de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/tombolas" className="btn-primary text-sm">
            <Icon name="add" className="text-base" />Nouvelle tombola
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icon: 'confirmation_number', label: 'Tombolas actives',    value: stats?.tombolas_actives,      color: 'blue' },
          { icon: 'emoji_events',        label: 'Tombolas terminées',  value: stats?.tombolas_terminees,    color: 'green' },
          { icon: 'people',              label: 'Utilisateurs',         value: stats?.total_utilisateurs,    color: 'blue' },
          { icon: 'sell',                label: 'Tickets vendus',       value: stats?.total_tickets_vendus,  color: 'orange' },
          { icon: 'account_balance',     label: 'Revenus totaux',       value: stats ? formatFCFA(stats.revenus_total_fcfa) : '—', color: 'green' },
          { icon: 'pending',             label: 'Paiements en attente', value: stats?.paiements_en_attente,  color: 'orange' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} loading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Tombolas en cours */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Tombolas en cours</h2>
          <Link to="/admin/tombolas" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            Gérer <Icon name="chevron_right" className="text-base" />
          </Link>
        </div>
        {tombolas.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Icon name="confirmation_number" className="text-4xl mb-2" />
            <p>Aucune tombola active</p>
            <Link to="/admin/tombolas" className="btn-primary text-sm mt-4 inline-flex">Créer une tombola</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tombolas.map((t) => {
              const pct   = Math.round((t.tickets_vendus / t.nombre_tickets) * 100);
              const badge = statutBadge[t.statut] || {};
              return (
                <div key={t.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{t.titre}</h3>
                        <span className={badge.cls}>{badge.label}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t.tickets_vendus?.toLocaleString()} / {t.nombre_tickets?.toLocaleString()} tickets</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span><Icon name="payments" className="text-xs mr-1" />{formatFCFA(t.collecte_fcfa)}</span>
                        <span><Icon name="event" className="text-xs mr-1" />Tirage le {formatDate(t.date_tirage)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {['ouverte', 'complete'].includes(t.statut) && (
                        <Link to={`/admin/tirage/${t.id}`} className="btn-primary text-xs py-1.5 px-3">
                          <Icon name="casino" className="text-sm" />Tirage
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Liens rapides */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/admin/tombolas',     icon: 'confirmation_number', label: 'Tombolas',      color: 'bg-blue-50 text-primary-700' },
            { to: '/admin/utilisateurs', icon: 'people',              label: 'Utilisateurs',  color: 'bg-green-50 text-green-700' },
            { to: '/admin/transactions', icon: 'receipt_long',        label: 'Transactions',  color: 'bg-orange-50 text-orange-700' },
            { to: '/admin/transactions?export=1', icon: 'download',   label: 'Export CSV',    color: 'bg-purple-50 text-purple-700' },
          ].map(({ to, icon, label, color }) => (
            <Link key={to} to={to}
              className="card p-5 flex flex-col items-center gap-2 hover:shadow-hover transition-all hover:-translate-y-0.5 text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon name={icon} className="text-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
