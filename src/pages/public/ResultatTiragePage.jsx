import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tirageService } from '@/services/index';
import { PageLoader } from '@/components/common';
import { formatFCFA, formatDateTime } from '@/utils/helpers';

export default function ResultatTiragePage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['tirage', id],
    queryFn:  () => tirageService.resultat(id),
    select:   (r) => r.data.data.tirage,
  });

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="text-center py-20">Aucun résultat disponible.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card overflow-hidden">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 p-8 text-center">
          {data.photo_remise_url && (
            <img src={data.photo_remise_url} alt="Remise" className="w-full h-48 object-cover rounded-xl mb-6" />
          )}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <div className="text-6xl mb-3">🏆</div>
          </motion.div>
          <h1 className="text-white text-2xl font-extrabold mb-1">Résultat du Tirage !</h1>
          <p className="text-primary-300 text-sm">{data.titre}</p>
        </div>
        <div className="p-8 space-y-5">
          <div className="text-center p-5 bg-gold-light rounded-2xl border border-gold-DEFAULT">
            <p className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-1">Ticket Gagnant</p>
            <p className="text-3xl font-extrabold text-amber-800 font-mono">{data.numero_gagnant}</p>
            <p className="text-amber-700 mt-1 font-semibold">{data.prenom_masque} {data.nom}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Date du tirage', val: formatDateTime(data.date_tirage) },
              { label: 'Méthode', val: data.methode === 'automatique' ? 'CSPRNG Auto' : 'Manuel' },
              { label: 'Tickets participants', val: data.nb_tickets_eligibles?.toLocaleString('fr') },
              { label: 'Valeur du lot', val: formatFCFA(data.valeur_lot) },
            ].map((r, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">{r.label}</p>
                <p className="font-semibold text-gray-900 mt-0.5">{r.val}</p>
              </div>
            ))}
          </div>
          {data.rapport_pdf_url && (
            <a href={data.rapport_pdf_url} target="_blank" rel="noopener noreferrer"
              className="btn-outline w-full py-3 text-sm justify-center">
              <span className="material-icons-round text-base">picture_as_pdf</span>
              Télécharger le rapport officiel
            </a>
          )}
          <Link to="/gagnants" className="btn-primary w-full py-3 text-sm justify-center">
            <span className="material-icons-round text-base">emoji_events</span>
            Voir tous les gagnants
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
