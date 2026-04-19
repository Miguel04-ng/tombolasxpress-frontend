import api from './api';

export const paiementService = {
  creerSession:    (data) => api.post('/paiements/session', data),
  initierPaiement: (data) => api.post('/paiements/initier', data),
  statut:          (id)   => api.get(`/paiements/${id}/statut`),
  mesPaiements:    (p)    => api.get('/paiements/mes-paiements', { params: p }),
};

export const ticketService = {
  mesTickets:      (p)      => api.get('/tickets/mes-tickets', { params: p }),
  verifier:        (numero) => api.get(`/tickets/verifier/${numero}`),
  ticketsTombola:  (id, p)  => api.get(`/tickets/tombola/${id}`, { params: p }),
};

export const tirageService = {
  liste:           (p)  => api.get('/tirages', { params: p }),
  resultat:        (id) => api.get(`/tirages/tombola/${id}`),
  lancer:          (id, methode) => api.post(`/tirages/tombola/${id}/lancer`, { methode }),
  annuler:         (id) => api.post(`/tirages/tombola/${id}/annuler`),
};

export const utilisateurService = {
  mesParticipations: () => api.get('/utilisateurs/mes-participations'),
};

export const notificationService = {
  mesNotifications: (p) => api.get('/notifications/mes-notifications', { params: p }),
};

export const adminService = {
  dashboard:            ()     => api.get('/admin/dashboard'),
  utilisateurs:         (p)    => api.get('/admin/utilisateurs', { params: p }),
  toggleBlocage:        (id)   => api.patch(`/admin/utilisateurs/${id}/toggle-blocage`),
  transactions:         (p)    => api.get('/admin/transactions', { params: p }),
  exportCSV:            (p)    => api.get('/admin/export-csv', { params: p, responseType: 'blob' }),
  webhooksLogs:         (p)    => api.get('/admin/webhooks-logs', { params: p }),
};
