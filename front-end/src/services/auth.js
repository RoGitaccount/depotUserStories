// src/services/auth.js
import axiosInstance from './axiosInstance';

// Fonction pour récupérer l'utilisateur depuis le cookie (via l'API /me)
export async function fetchUserFromCookie() {
  try {
    console.log("[auth.js] ➤ Appel à /token/me");
    const response = await axiosInstance.get("/token/me");
    console.log("[auth.js] ✅ /me OK :", response.data);
    return response.data;
  } catch (err) {
    console.error("[auth.js] ❌ Erreur lors de fetchUserFromCookie :", err.response?.data);
    // L'intercepteur axiosInstance gère déjà le refresh automatiquement
    return null;
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
export async function isAuthenticated() {
  const user = await fetchUserFromCookie();
  return !!user;
}

// Fonction pour récupérer l'ID utilisateur depuis le token
export async function getUserIdFromToken() {
  try {
    const user = await fetchUserFromCookie();
    return user?.id || null;
  } catch (error) {
    console.error("[auth.js] ❌ Erreur lors de getUserIdFromToken :", error);
    return null;
  }
}

// Cette fonction n'est plus nécessaire car la logique est dans axiosInstance
// Mais on la garde pour compatibilité si elle est utilisée ailleurs
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/token/refresh-token');
   
    if (response.status === 200) {
      console.log('Token rafraîchi avec succès');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors du refresh du token:', error);
    return false;
  }
};

// Fonction de déconnexion
export const logout = async () => {
  try {
    await axiosInstance.post('/token/logout');
    window.location.href = '/login';
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    window.location.href = '/login';
  }
};
