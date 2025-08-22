import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axiosInstance from "../services/axiosInstance";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour vérifier si on est sur une page d'authentification
  const isAuthPage = () => {
    const authPages = ['/login', '/register', '/verify-code', '/forgot-password', '/resetpassword', '/confidentialite'];
    return authPages.includes(window.location.pathname);
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Ne pas vérifier l'auth sur les pages d'authentification
      if (isAuthPage()) {
        console.log('Sur une page d\'auth, pas de vérification automatique');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Vérification de l\'authentification...');
        // L'intercepteur gère automatiquement le refresh si nécessaire
        const response = await axiosInstance.get('/token/me');
        console.log('Utilisateur authentifié:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        setUser(null);
        setIsAuthenticated(false);
        // Ne pas rediriger ici, laisser l'intercepteur s'en charger
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      const response = await axiosInstance.get('/token/me');
      console.log('Login réussi:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erreur lors du login:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/token/logout');
      console.log('Logout réussi');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
