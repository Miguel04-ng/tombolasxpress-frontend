import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatFCFA = (amount) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  format(new Date(date), 'dd MMM yyyy', { locale: fr });

export const formatDateTime = (date) =>
  format(new Date(date), "dd MMM yyyy 'à' HH:mm", { locale: fr });

export const fromNow = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });

export const progressPct = (vendu, total) =>
  Math.min(100, Math.round((vendu / total) * 100));

export const maskName = (prenom, nom) => {
  if (!prenom) return nom;
  return `${prenom[0]}*** ${nom}`;
};

export const statutBadge = {
  ouverte:   { label: 'En cours',  cls: 'badge-green' },
  complete:  { label: 'Complet',   cls: 'badge-blue' },
  en_tirage: { label: 'Tirage !',  cls: 'badge-orange' },
  terminee:  { label: 'Terminée',  cls: 'badge-gray' },
  annulee:   { label: 'Annulée',   cls: 'badge-red' },
  brouillon: { label: 'Brouillon', cls: 'badge-gray' },
};

export const paiementBadge = {
  en_attente: { label: 'En attente', cls: 'badge-orange' },
  confirme:   { label: 'Confirmé',   cls: 'badge-green' },
  echoue:     { label: 'Échoué',     cls: 'badge-red' },
  expire:     { label: 'Expiré',     cls: 'badge-gray' },
  rembourse:  { label: 'Remboursé',  cls: 'badge-blue' },
};

export const operateurConfig = {
  MTN:    { label: 'MTN MoMo',    color: '#FFC107', bg: '#FFF8E1' },
  ORANGE: { label: 'Orange Money', color: '#FF6D00', bg: '#FFF3E0' },
};
