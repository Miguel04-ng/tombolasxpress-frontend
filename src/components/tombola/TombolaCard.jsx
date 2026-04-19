import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatFCFA, formatDate, progressPct, statutBadge } from '@/utils/helpers';

export default function TombolaCard({ tombola, index = 0 }) {
  const pct    = progressPct(tombola.tickets_vendus, tombola.nombre_tickets);
  const badge  = statutBadge[tombola.statut] || statutBadge.ouverte;
  const almost = tombola.tickets_restants <= tombola.nombre_tickets * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/tombolas/${tombola.id}`} className="card-hover block group">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary-800 to-primary-600 overflow-hidden">
          {tombola.photo_url ? (
            <img src={tombola.photo_url} alt={tombola.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="material-icons-round text-white/30 text-7xl">confirmation_number</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={badge.cls}>{badge.label}</span>
            {almost && tombola.statut === 'ouverte' && (
              <span className="badge bg-accent text-white animate-pulse-slow">
                <span className="material-icons-round text-xs">local_fire_department</span>
                Presque complet !
              </span>
            )}
            {tombola.sponsor && (
              <span className="badge bg-gold text-amber-900">
                <span className="material-icons-round text-xs">stars</span>
                Sponsorisé
              </span>
            )}
          </div>

          {/* Valeur lot */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
              {formatFCFA(tombola.valeur_lot)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {tombola.titre}
          </h3>

          {/* Prix ticket */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="material-icons-round text-accent text-base">confirmation_number</span>
              <span className="text-accent font-bold text-lg">{formatFCFA(tombola.prix_ticket)}</span>
              <span className="text-gray-400 text-xs">/ticket</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Tirage</p>
              <p className="text-xs font-semibold text-gray-700">{formatDate(tombola.date_tirage)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tombola.tickets_vendus.toLocaleString('fr')} vendus</span>
              <span className="font-semibold text-primary-600">{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-right">
              {tombola.tickets_restants.toLocaleString('fr')} tickets restants
            </p>
          </div>

          {/* CTA */}
          {tombola.statut === 'ouverte' && (
            <div className="mt-4 btn-accent w-full text-sm py-2.5">
              <span className="material-icons-round text-base">shopping_cart</span>
              Participer maintenant
            </div>
          )}
          {tombola.statut === 'terminee' && (
            <div className="mt-4 btn-outline w-full text-sm py-2.5 border-gold text-amber-600">
              <span className="material-icons-round text-base">emoji_events</span>
              Voir le gagnant
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
