import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001/api',
  withCredentials: true,
});

// Variable pour éviter les appels multiples simultanés de refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Fonction utilitaire pour vérifier si on est sur une page d'authentification
const isAuthPage = () => {
  const authPages = ['/login', '/register', '/verify-code', '/forgot-password', '/resetpassword','/Contact','/products'];
  return authPages.includes(window.location.pathname);
};

axiosInstance.interceptors.response.use(
  response => {
    // Vérifier si le backend demande une reconnexion
    if (response.data?.mustReconnect) {
      toast.info("Votre email a été modifié. Veuillez vous reconnecter.");
      // Éviter la redirection si on est déjà sur une page d'auth
      if (!isAuthPage()) {
        window.location.href = "/login";
      }
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;
   
    console.log('Interceptor error:', error.response?.status, error.response?.data);
   
    // Vérifier si c'est une erreur 401 et si ce n'est pas déjà un retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (error.response.data?.message === "Token invalide ou expiré." ||
       error.response.data?.message === "Token manquant. Veuillez vous connecter." ||
       error.response.data?.message === "Non authentifié.")
    ) {
      // Éviter le refresh pour les routes de login/register/refresh
      if (originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/verify') ||
          originalRequest.url?.includes('/token/refresh-token')) {
        console.log('Éviter le refresh pour:', originalRequest.url);
        return Promise.reject(error);
      }

      // Si on est déjà sur une page d'authentification, ne pas essayer de refresh
      if (isAuthPage()) {
        console.log('Sur une page d\'auth, pas de refresh nécessaire');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('Refresh déjà en cours, mise en queue...');
        // Si un refresh est déjà en cours, mettre en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Relancer la requête originale après le refresh
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Tentative de refresh du token...');
        // Créer une instance temporaire pour éviter l'intercepteur
        const tempAxios = axios.create({
          baseURL: 'http://localhost:8001/api',
          withCredentials: true,
        });
       
        const response = await tempAxios.post('/token/refresh-token');
       
        if (response.status === 200) {
          console.log('Token rafraîchi avec succès');
          processQueue(null, 'success');
          isRefreshing = false;
          // Relancer la requête originale avec le nouveau token
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erreur lors du refresh:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
       
        // Vérifier si c'est une erreur de refresh token expiré
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          toast.warn("Session expirée. Veuillez vous reconnecter.");
          // Nettoyer les cookies côté client si possible
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Rediriger vers login seulement si on n'est pas déjà sur une page d'auth
          if (!isAuthPage()) {
            window.location.href = "/login";
          }
        }
       
        return Promise.reject(refreshError);
      }
    }
   
    return Promise.reject(error);
  }
);

export default axiosInstance;

