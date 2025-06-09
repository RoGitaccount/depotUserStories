// requests.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api",
});

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cas : token invalide ou expiré
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.message === "Token invalide ou expiré."
    ) {
      // Supprimer le token
      localStorage.removeItem("token");

      // Redirection vers la page de connexion
      window.location.href = "/login"; // ou utilise `useNavigate()` si dans un composant
    }

    return Promise.reject(error);
  }
);

export default api;
