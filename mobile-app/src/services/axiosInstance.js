// // services/axiosInstance.js (React Native)
// import axios from 'axios';
// import { getToken, getRefreshToken, storeTokens, removeTokens } from './authStorage';
// import { Alert } from 'react-native';
// import Constants from 'expo-constants';

// // Récupère l'IP définie dans app.json -> extra.expo_ip_url
// const expoIpUrl =
//   Constants.expoConfig?.extra?.expo_ip_url ||
//   Constants.manifest?.extra?.expo_ip_url ||
//   'localhost'; // fallback si rien n'est défini

// const BASE_URL = `http://${expoIpUrl}:8001/api`;

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// let isRefreshing = false;
// let failedQueue = [];

// //  AJOUT : Callback pour forcer la déconnexion depuis l'extérieur
// let logoutCallback = null;

// //  AJOUT : Fonction pour enregistrer le callback de déconnexion
// export const setLogoutCallback = (callback) => {
//   logoutCallback = callback;
// };

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const token = await getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then((token) => {
//           originalRequest.headers.Authorization = 'Bearer ' + token;
//           return axiosInstance(originalRequest);
//         });
//       }
      
//       isRefreshing = true;
      
//       try {
//         const refreshToken = await getRefreshToken();
//         if (!refreshToken) throw new Error('No refresh token');
        
//         const res = await axios.post(`${BASE_URL}/token/refresh-token`, {}, {
//           headers: { Cookie: `refreshToken=${refreshToken}` }
//         });
        
//         const newToken = res.data?.token;
//         const newRefreshToken = res.data?.refreshToken;
        
//         await storeTokens(newToken, newRefreshToken);
//         axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
//         processQueue(null, newToken);
        
//         // ✅ AJOUT : Mettre à jour le contexte avec le nouveau token
//         if (logoutCallback) {
//           // On peut aussi créer une fonction updateTokenCallback si nécessaire
//           console.log('[axiosInstance] Token refreshed successfully');
//         }
        
//         return axiosInstance(originalRequest);
//       } catch (err) {
//         console.log('[axiosInstance] Refresh token failed, forcing logout');
        
//         await removeTokens();
//         processQueue(err, null);
        
//         // ✅ AJOUT : Forcer la déconnexion via le callback
//         if (logoutCallback) {
//           logoutCallback();
//         }
        
//         Alert.alert("Session expirée", "Veuillez vous reconnecter.");
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

// services/axiosInstance.js (React Native)
import axios from 'axios';
import { getToken, removeToken } from './authStorage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Récupère l'IP définie dans app.json -> extra.expo_ip_url
const expoIpUrl =
  Constants.expoConfig?.extra?.expo_ip_url ||
  Constants.manifest?.extra?.expo_ip_url ||
  'localhost'; // fallback si rien n'est défini

const BASE_URL = `http://${expoIpUrl}:8001/api`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Callback pour forcer la déconnexion depuis l'extérieur
let logoutCallback = null;
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// axiosInstance.js
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    console.log("[axiosInstance] token utilisé:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ Intercepteur : gère les erreurs 401 (token expiré/invalide)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('[axiosInstance] Unauthorized, forcing logout');
      await removeToken();

      if (logoutCallback) {
        logoutCallback();
      }

      Alert.alert("Session expirée", "Veuillez vous reconnecter.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
