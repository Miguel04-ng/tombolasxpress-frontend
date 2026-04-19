import axios from 'axios';
import toast  from 'react-hot-toast';

// ── Instance Axios ────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : ajoute le JWT ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('txp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur réponse : gestion erreurs globales ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || 'Une erreur est survenue.';

    if (status === 401) {
      // Token expiré → déconnexion
      localStorage.removeItem('txp_token');
      localStorage.removeItem('txp_user');
      if (!window.location.pathname.includes('/auth')) {
        toast.error('Session expirée. Reconnectez-vous.');
        window.location.href = '/auth/connexion';
      }
    } else if (status === 403) {
      toast.error('Accès refusé.');
    } else if (status === 429) {
      toast.error('Trop de tentatives. Réessayez dans quelques minutes.');
    } else if (status === 500) {
      toast.error('Erreur serveur. Réessayez dans quelques instants.');
    }

    return Promise.reject(error);
  }
);

export default api;
