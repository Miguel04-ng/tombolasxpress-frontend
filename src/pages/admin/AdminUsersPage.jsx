import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '@/services/index';
import { formatDate } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';
import Icon from '@/components/common/Icon';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn:  () => adminService.utilisateurs({ search, page, limit: 20 }),
    select:   (r) => r.data.data,
  });

  const blockMutation = useMutation({
    mutationFn: (id) => adminService.toggleBlocage(id),
    onSuccess: (r) => {
      const est_bloque = r.data.data.est_bloque;
      toast.success(est_bloque ? 'Utilisateur bloqué' : 'Utilisateur débloqué');
      qc.invalidateQueries(['admin-users']);
    },
    onError: () => toast.error('Erreur lors de l\'opération'),
  });

  const users = data?.utilisateurs || [];
  const total = data?.pagination?.total || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} utilisateurs enregistrés</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par nom, email ou téléphone…" className="input pl-11" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Icon name="people" className="text-4xl mb-2" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {u.prenom?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.telephone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role}</span>
                    {u.est_bloque ? <span className="badge badge-red">Bloqué</span> : <span className="badge badge-green">Actif</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    {u.nb_tickets} tickets • Inscrit le {formatDate(u.created_at)}
                  </div>
                  {u.role !== 'admin' && (
                    <button onClick={() => blockMutation.mutate(u.id)}
                      disabled={blockMutation.isPending}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.est_bloque ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                      {u.est_bloque ? 'Débloquer' : 'Bloquer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {['Utilisateur', 'Téléphone', 'Rôle', 'Tickets', 'Statut', 'Inscrit le', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {u.prenom?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{u.prenom} {u.nom}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.telephone}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{u.nb_tickets}</td>
                      <td className="px-4 py-3">
                        {u.est_bloque ? <span className="badge badge-red">Bloqué</span> : <span className="badge badge-green">Actif</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => blockMutation.mutate(u.id)}
                            disabled={blockMutation.isPending}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.est_bloque ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {u.est_bloque ? 'Débloquer' : 'Bloquer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
