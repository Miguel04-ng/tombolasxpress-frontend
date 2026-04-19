// src/pages/public/GagnantsPage.jsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tombolaService } from '@/services/tombola.service';
import { PageLoader, EmptyState } from '@/components/common';
import { formatFCFA, formatDate } from '@/utils/helpers';

export default function GagnantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['gagnants'],
    queryFn:  () => tombolaService.gagnants({ limit: 50 }),
    select:   (r) => r.data.data.gagnants,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-primary-700 mb-2">🏆 Gagnants & Transparence</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Retrouvez tous les gagnants de nos tombolas passées. Chaque tirage est certifié par algorithme CSPRNG.
        </p>
      </div>

      {isLoading ? <PageLoader /> : (
        !data?.length ? (
          <EmptyState icon="emoji_events" title="Aucun tirage effectué" desc="Les résultats des tirages apparaîtront ici." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                <div className="relative h-40 bg-primary-800">
                  {g.photo_remise_url ? (
                    <img src={g.photo_remise_url} alt="" className="w-full h-full object-cover" />
                  ) : g.photo_url ? (
                    <img src={g.photo_url} alt="" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="material-icons-round text-white/30 text-6xl">emoji_events</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-gold-DEFAULT text-amber-900 font-bold text-xs px-2 py-0.5 rounded-full inline-block mb-1">
                      {g.numero_gagnant}
                    </div>
                    <p className="text-white font-bold text-sm leading-tight truncate">{g.tombola_titre}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gold-light rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-amber-600 text-base">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{g.prenom_masque} {g.nom}</p>
                      <p className="text-xs text-gray-400">{formatDate(g.date_tirage)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                    <span>{g.nb_tickets_eligibles?.toLocaleString('fr')} tickets participants</span>
                    <span className="font-semibold text-primary-600">{formatFCFA(g.valeur_lot)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
