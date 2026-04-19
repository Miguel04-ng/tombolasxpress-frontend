import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { Spinner } from '@/components/common';
import Icon from '@/components/common/Icon';

export default function ProfilPage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab]         = useState('profil');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '' });
  const [pwdForm, setPwdForm]   = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirm: '' });
  const [showPwd, setShowPwd]   = useState({ ancien: false, nouveau: false });

  const modifierMutation = useMutation({
    mutationFn: (d) => authService.modifierProfil(d),
    onSuccess: (r) => {
      updateUser({ ...user, ...form });
      toast.success('Profil mis à jour !');
      setEditMode(false);
      qc.invalidateQueries(['profil']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur lors de la mise à jour'),
  });

  const pwdMutation = useMutation({
    mutationFn: (d) => authService.changerPassword(d),
    onSuccess: () => { toast.success('Mot de passe modifié !'); setPwdForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirm: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  const handleSaveProfil = (e) => {
    e.preventDefault();
    modifierMutation.mutate(form);
  };

  const handleSavePwd = (e) => {
    e.preventDefault();
    if (pwdForm.nouveau_mot_de_passe !== pwdForm.confirm) return toast.error('Les mots de passe ne correspondent pas');
    if (pwdForm.nouveau_mot_de_passe.length < 8) return toast.error('Minimum 8 caractères');
    pwdMutation.mutate({ ancien_mot_de_passe: pwdForm.ancien_mot_de_passe, nouveau_mot_de_passe: pwdForm.nouveau_mot_de_passe });
  };

  const TABS = [
    { id: 'profil',   label: 'Mon profil',      icon: 'person' },
    { id: 'securite', label: 'Sécurité',         icon: 'lock' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header profil */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0">
          {user?.prenom?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{user?.prenom} {user?.nom}</h1>
          <p className="text-gray-500 text-sm truncate">{user?.email}</p>
          <p className="text-gray-500 text-sm">{user?.telephone}</p>
          <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>
            <Icon name={user?.role === 'admin' ? 'admin_panel_settings' : 'person'} className="text-xs" />
            {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon name={t.icon} className="text-base" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab Profil */}
      {tab === 'profil' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Informations personnelles</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn-outline text-sm py-1.5 px-3">
                <Icon name="edit" className="text-base" />Modifier
              </button>
            )}
          </div>
          {editMode ? (
            <form onSubmit={handleSaveProfil} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                  <input className="input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                  <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone Mobile Money</label>
                <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+237..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={modifierMutation.isPending}>
                  {modifierMutation.isPending ? <Spinner size="sm" color="white" /> : <Icon name="save" className="text-base" />}
                  Enregistrer
                </button>
                <button type="button" className="btn-ghost" onClick={() => setEditMode(false)}>Annuler</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Prénom',    value: user?.prenom,    icon: 'person' },
                { label: 'Nom',       value: user?.nom,       icon: 'person' },
                { label: 'Email',     value: user?.email,     icon: 'email' },
                { label: 'Téléphone', value: user?.telephone, icon: 'phone' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon name={icon} className="text-primary-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Sécurité */}
      {tab === 'securite' && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Changer le mot de passe</h2>
          <form onSubmit={handleSavePwd} className="space-y-4">
            {[
              { key: 'ancien_mot_de_passe', label: 'Mot de passe actuel',  showKey: 'ancien' },
              { key: 'nouveau_mot_de_passe', label: 'Nouveau mot de passe', showKey: 'nouveau' },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <input type={showPwd[showKey] ? 'text' : 'password'} value={pwdForm[key]}
                    onChange={(e) => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                    className="input pr-10" required placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPwd({ ...showPwd, [showKey]: !showPwd[showKey] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon name={showPwd[showKey] ? 'visibility_off' : 'visibility'} className="text-base" />
                  </button>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
              <input type="password" value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                className={`input ${pwdForm.confirm && pwdForm.confirm !== pwdForm.nouveau_mot_de_passe ? 'border-red-400' : ''}`}
                placeholder="••••••••" required />
              {pwdForm.confirm && pwdForm.confirm !== pwdForm.nouveau_mot_de_passe && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={pwdMutation.isPending}>
              {pwdMutation.isPending ? <Spinner size="sm" color="white" /> : <Icon name="lock" className="text-base" />}
              Modifier le mot de passe
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
