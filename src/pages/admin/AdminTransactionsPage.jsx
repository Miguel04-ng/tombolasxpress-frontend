import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '@/services/index';
import { formatFCFA, formatDateTime } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';
import StatCard from '@/components/common/StatCard';
import Icon from '@/components/common/Icon';

const TYPE_LABELS = {
  entree_ticket:   { label: 'Achat ticket',     cls: 'badge-green',  sign: '+' },
  commission:      { label: 'Commission',        cls: 'badge-blue',   sign: '+' },
  remboursement:   { label: 'Remboursement',     cls: 'badge-orange', sign: '−' },
  lot_verse:       { label: 'Lot distribué',     cls: 'badge-red',    sign: '−' },
  frais_operateur: { label: 'Frais opérateur',   cls: 'badge-gray',   sign: '−' },
};

export default function AdminTransactionsPage() {
  const [type, setType]           = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', type],
    queryFn:  () => adminService.transactions({ type: type || undefined, limit: 100 }),
    select:   (r) => r.data.data,
  });

  const transactions = data?.transactions || [];
  const totaux = data?.totaux || {};

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const r = await adminService.exportCSV({});
      const url = URL.createObjectURL(new Blob([r.data]));
      const a   = document.createElement('a');
      a.href = url; a.download = `transactions_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions financières</h1>
          <p className="text-gray-500 text-sm mt-1">Audit complet de tous les flux FCFA</p>
        </div>
        <button onClick={handleExport} disabled={exportLoading} className="btn-outline text-sm">
          {exportLoading ? <Spinner size="sm" /> : <Icon name="download" className="text-base" />}
          Export CSV
        </button>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="trending_up"   label="Entrées"        value={formatFCFA(totaux.total_entrees || 0)}       color="green" />
        <StatCard icon="workspace_premium" label="Commissions" value={formatFCFA(totaux.total_commissions || 0)}  color="blue" />
        <StatCard icon="undo"          label="Remboursements" value={formatFCFA(totaux.total_remboursements || 0)} color="orange" />
        <StatCard icon="receipt"       label="Frais opérateur" value={formatFCFA(totaux.total_frais || 0)}        color="red" />
      </div>

      {/* Filtre type */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setType('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!type ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Tout
        </button>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setType(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === k ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Table transactions */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : transactions.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Icon name="receipt_long" className="text-4xl mb-2" />
          <p>Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Date', 'Type', 'Tombola', 'Utilisateur', 'Montant'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const t = TYPE_LABELS[tx.type] || { label: tx.type, cls: 'badge-gray', sign: '' };
                  const isPos = tx.montant > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(tx.created_at)}</td>
                      <td className="px-4 py-3"><span className={`badge ${t.cls}`}>{t.label}</span></td>
                      <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{tx.tombola || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {tx.nom ? `${tx.prenom} ${tx.nom}` : '—'}
                      </td>
                      <td className={`px-4 py-3 font-bold text-sm ${isPos ? 'text-green-600' : 'text-red-500'}`}>
                        {isPos ? '+' : ''}{formatFCFA(tx.montant)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
