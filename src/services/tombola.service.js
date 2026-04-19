import api from './api';

export const tombolaService = {
  lister:    (params) => api.get('/tombolas', { params }),
  detail:    (id)     => api.get(`/tombolas/${id}`),
  gagnants:  (params) => api.get('/tombolas/gagnants', { params }),

  // Admin
  creer:             (data) => api.post('/tombolas', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  modifier:          (id, data) => api.put(`/tombolas/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  ajouterPhotoRemise:(id, data) => api.post(`/tombolas/${id}/photo-remise`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
