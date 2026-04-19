import api from './api';

export const authService = {
  inscrire: (data) => api.post('/auth/inscrire', data),
  connecter: (data) => api.post('/auth/connecter', data),
  getProfil: () => api.get('/auth/profil'),
  modifierProfil: (data) => api.put('/auth/profil', data),
  changerPassword: (data) => api.put('/auth/changer-password', data),
  demanderReset: (email) => api.post('/auth/reset-demande', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
