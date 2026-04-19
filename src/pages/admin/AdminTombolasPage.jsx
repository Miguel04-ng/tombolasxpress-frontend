import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tombolaService } from '@/services/tombola.service';
import { formatFCFA, formatDate, statutBadge } from '@/utils/helpers';
import Modal from '@/components/common/Modal';
import Spinner from '@/components/common/Spinner';
import Icon from '@/components/common/Icon';

const STATUS_TABS = [
  { val: 'ouverte',   label: 'En cours' },
  { val: 'terminee',  label: 'Terminées' },
  { val: 'brouillon', label: 'Brouillons' },
  { val: 'annulee',   label: 'Annulées' },
];

const INITIAL_FORM = {
  titre: '', description: '', valeur_lot: '', prix_ticket: '',
  nombre_tickets: '', date_tirage: '', devise: 'XAF', sponsor: '',
};

export default function AdminTombolasPage() {
  const qc = useQueryClient();
  const [statut, setStatut] = useState('ouverte');
  const [showModal, setShowModal] = useState(false);
  const [editTombola, setEditTombola] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const fileRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tombolas', statut],
    queryFn:  () => tombolaService.lister({ statut, limit: 50 }),
    select:   (r) => r.data.data.tombolas,
  });

  const creerMutation = useMutation({
    mutationFn: (fd) => tombolaService.creer(fd),
    onSuccess: () => { toast.success('Tombola créée !'); qc.invalidateQueries(['admin-tombolas']); setShowModal(false); setForm(INITIAL_FORM); setPhotoFile(null); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  const modifierMutation = useMutation({
    mutationFn: ({ id, fd }) => tombolaService.modifier(id, fd),
    onSuccess: () => { toast.success('Tombola mise à jour !'); qc.invalidateQueries(['admin-tombolas']); setShowModal(false); setEditTombola(null); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (photoFile) fd.append('photo', photoFile);
    if (editTombola) modifierMutation.mutate({ id: editTombola.id, fd });
    else creerMutation.mutate(fd);
  };

  const openEdit = (t) => {
    setEditTombola(t);
    setForm({
      titre: t.titre, description: t.description, valeur_lot: t.valeur_lot,
      prix_ticket: t.prix_ticket, nombre_tickets: t.nombre_tickets,
      date_tirage: t.date_tirage?.slice(0, 16), devise: t.devise, sponsor: t.sponsor || '',
    });
    setShowModal(true);
  };

  const openCreate = () => { setEditTombola(null); setForm(INITIAL_FORM); setPhotoFile(null); setShowModal(true); };

  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tombolas</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez toutes les tombolas de la plateforme</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="add" className="text-base" />Nouvelle tombola
        </button>
      </div>

      {/* Tabs statut */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((t) => (
          <button key={t.val} onClick={() => setStatut(t.val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statut === t.val ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.length ? (
        <div className="card p-12 text-center text-gray-400">
          <Icon name="confirmation_number" className="text-4xl mb-2" />
          <p className="font-medium">Aucune tombola dans cette catégorie</p>
          <button onClick={openCreate} className="btn-primary text-sm mt-4 inline-flex">Créer une tombola</button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((t) => {
            const pct   = Math.round((t.tickets_vendus / t.nombre_tickets) * 100);
            const badge = statutBadge[t.statut] || {};
            return (
              <div key={t.id} className="card p-4 md:p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {t.photo_url ? <img src={t.photo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Icon name="emoji_events" className="text-gray-300 text-2xl" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-gray-900">{t.titre}</h3>
                        {t.sponsor && <p className="text-xs text-gray-400">Sponsorisé par {t.sponsor}</p>}
                      </div>
                      <span className={badge.cls}>{badge.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2 mb-2">
                      <span><strong>{formatFCFA(t.prix_ticket)}</strong>/ticket</span>
                      <span><strong>{t.tickets_vendus}</strong>/{t.nombre_tickets} vendus</span>
                      <span>Lot: <strong>{formatFCFA(t.valeur_lot)}</strong></span>
                      <span>Tirage: <strong>{formatDate(t.date_tirage)}</strong></span>
                    </div>
                    <div className="progress-bar max-w-xs">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openEdit(t)} className="btn-outline text-xs py-1.5 px-3">
                      <Icon name="edit" className="text-sm" />Modifier
                    </button>
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

      {/* Modal créer/modifier */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg"
        title={editTombola ? 'Modifier la tombola' : 'Créer une nouvelle tombola'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre du lot *</label>
              <input className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Gagnez un iPhone 15 Pro !" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea className="input resize-none" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du lot..." required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valeur du lot (FCFA) *</label>
              <input type="number" className="input" value={form.valeur_lot}
                onChange={(e) => setForm({ ...form, valeur_lot: e.target.value })} min="1" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix du ticket (FCFA) *</label>
              <input type="number" className="input" value={form.prix_ticket}
                onChange={(e) => setForm({ ...form, prix_ticket: e.target.value })} min="100" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de tickets *</label>
              <input type="number" className="input" value={form.nombre_tickets}
                onChange={(e) => setForm({ ...form, nombre_tickets: e.target.value })} min="10" required />
              {form.nombre_tickets && (
                <p className="text-xs text-gray-400 mt-1">Seuil min (80%) : {Math.ceil(form.nombre_tickets * 0.8)} tickets</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date du tirage *</label>
              <input type="datetime-local" className="input" value={form.date_tirage}
                onChange={(e) => setForm({ ...form, date_tirage: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sponsor (optionnel)</label>
              <input className="input" value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} placeholder="Nom du sponsor" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Devise</label>
              <select className="input" value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value })}>
                <option value="XAF">FCFA (XAF)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo du lot</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 transition-colors">
                {photoFile ? (
                  <p className="text-sm text-green-600 font-medium">{photoFile.name}</p>
                ) : (
                  <>
                    <Icon name="cloud_upload" className="text-gray-300 text-3xl mb-1" />
                    <p className="text-sm text-gray-400">Cliquez pour sélectionner une image (JPG, PNG, WebP — max 5MB)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setPhotoFile(e.target.files[0])} />
            </div>
          </div>
          {/* Résumé */}
          {form.prix_ticket && form.nombre_tickets && (
            <div className="bg-primary-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-primary-700 mb-1">Résumé financier :</p>
              <div className="flex justify-between text-gray-600">
                <span>Collecte potentielle</span>
                <span className="font-bold">{formatFCFA(form.prix_ticket * form.nombre_tickets)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Marge brute estimée</span>
                <span className="font-bold text-green-700">{formatFCFA(form.prix_ticket * form.nombre_tickets - (form.valeur_lot || 0))}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-accent flex-1" disabled={isPending}>
              {isPending ? <Spinner size="sm" color="white" /> : <Icon name={editTombola ? 'save' : 'add'} className="text-base" />}
              {editTombola ? 'Sauvegarder' : 'Créer la tombola'}
            </button>
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
