import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { tombolaService } from '@/services/tombola.service';
import TombolaCard from '@/components/tombola/TombolaCard';
import { PageLoader, EmptyState } from '@/components/common';
import { formatFCFA } from '@/utils/helpers';

export default function HomePage() {
  const [statut, setStatut] = useState('ouverte');

  const { data, isLoading } = useQuery({
    queryKey:  ['tombolas', statut],
    queryFn:   () => tombolaService.lister({ statut }),
    select:    (r) => r.data.data,
  });

  const tombolas    = data?.tombolas || [];
  const pagination  = data?.pagination;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Tirages certifiés CSPRNG — 100% transparent
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-balance">
              Gagnez des lots<br />
              <span className="text-gold-DEFAULT">exceptionnels</span> au Cameroun
            </h1>
            <p className="text-primary-200 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Achetez vos tickets via MTN MoMo ou Orange Money. Participez aux tirages en direct et gagnez maison, voiture, téléphones et plus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#tombolas" className="btn-accent text-base px-7 py-3.5">
                <span className="material-icons-round">confirmation_number</span>
                Voir les tombolas
              </a>
              <Link to="/gagnants" className="btn-outline border-white text-white hover:bg-white/10 text-base px-7 py-3.5">
                <span className="material-icons-round">emoji_events</span>
                Gagnants précédents
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: 'confirmation_number', label: 'Tickets vendus',   value: 12840,  suffix: '+' },
              { icon: 'emoji_events',         label: 'Gagnants heureux', value: 124,    suffix: '' },
              { icon: 'account_balance_wallet', label: 'Lots distribués', value: 35000000, isFCFA: true },
              { icon: 'verified_user',        label: 'Tirages certifiés', value: 48,   suffix: '' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="material-icons-round text-gold-DEFAULT text-2xl mb-1">{s.icon}</span>
                <p className="text-2xl md:text-3xl font-extrabold text-white">
                  {s.isFCFA ? formatFCFA(s.value) : <><CountUp end={s.value} duration={2} separator=" " />{s.suffix}</>}
                </p>
                <p className="text-primary-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Opérateurs ────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <span className="font-medium">Paiements sécurisés via :</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="w-5 h-5 bg-amber-400 rounded-full" />
              <span className="font-semibold text-amber-800">MTN MoMo</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-5 h-5 bg-orange-500 rounded-full" />
              <span className="font-semibold text-orange-800">Orange Money</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-green-600">
            <span className="material-icons-round text-base">lock</span>
            Paiements 100% sécurisés
          </span>
        </div>
      </section>

      {/* ── Tombolas ──────────────────────────────────────── */}
      <section id="tombolas" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title">Tombolas disponibles</h2>
            {pagination && (
              <p className="text-gray-500 text-sm mt-1">{pagination.total} tombola{pagination.total > 1 ? 's' : ''} active{pagination.total > 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {[
              { val: 'ouverte',  label: 'En cours' },
              { val: 'terminee', label: 'Terminées' },
            ].map((t) => (
              <button key={t.val} onClick={() => setStatut(t.val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statut === t.val ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : tombolas.length === 0 ? (
          <EmptyState icon="confirmation_number" title="Aucune tombola disponible"
            desc="Revenez bientôt, de nouvelles tombolas arrivent régulièrement !"
            action={<Link to="/gagnants" className="btn-primary text-sm">Voir les gagnants passés</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tombolas.map((t, i) => <TombolaCard key={t.id} tombola={t} index={i} />)}
          </div>
        )}
      </section>

      {/* ── Comment ça marche ────────────────────────────── */}
      <section className="bg-primary-50 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="section-title text-center mb-10">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: 'person_add',           title: 'Inscrivez-vous',     desc: 'Créez votre compte gratuit en 30 secondes' },
              { step: 2, icon: 'confirmation_number',  title: 'Choisissez un lot',  desc: 'Parcourez les tombolas et sélectionnez vos tickets' },
              { step: 3, icon: 'payments',             title: 'Payez via MoMo',     desc: 'Confirmez avec votre code PIN MTN ou Orange' },
              { step: 4, icon: 'emoji_events',         title: 'Gagnez !',           desc: 'Tirage certifié en direct, gagnant notifié par SMS' },
            ].map((s) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: s.step * 0.1 }} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-primary-700 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="material-icons-round text-white text-2xl">{s.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-accent to-accent-dark text-white py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Prêt à tenter votre chance ?</h2>
          <p className="text-red-100 mb-7 text-lg">Rejoignez des milliers de Camerounais qui participent chaque jour.</p>
          <Link to="/auth/inscription" className="inline-flex items-center gap-2 bg-white text-accent font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors text-base shadow-lg">
            <span className="material-icons-round">rocket_launch</span>
            Commencer gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}
