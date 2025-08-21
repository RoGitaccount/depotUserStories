// // src/contexts/AuthProvider.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { AuthContext } from './AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { removeTokens } from '../services/authStorage';
// import { setLogoutCallback } from '../services/axiosInstance';
// import { jwtDecode } from 'jwt-decode'; // ✅ Import correct
// import { isTokenValid } from '../services/auth';

// const TOKEN_KEY = 'token';

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const loadTokenFromStorage = useCallback(async () => {
//     try {
//       const t = await AsyncStorage.getItem(TOKEN_KEY);
//       console.log('[AuthProvider] loadTokenFromStorage ->', !!t);
      
//       if (t && typeof t === 'string' && t.split('.').length === 3) {
//         try {
//           // ✅ Utiliser votre fonction isTokenValid existante
//           const tokenIsValid = await isTokenValid();
          
//           if (!tokenIsValid) {
//             console.log('[AuthProvider] Token expiré, nettoyage...');
//             await removeTokens();
//             setToken(null);
//             setUser(null);
//             setIsAuthenticated(false);
//           } else {
//             const decoded = jwtDecode(t);
//             console.log('[AuthProvider] Token valide, utilisateur:', decoded);
            
//             setToken(t);
//             setUser(decoded);
//             setIsAuthenticated(true);
//           }
//         } catch (err) {
//           console.warn('[AuthProvider] jwt decode failed', err);
//           await removeTokens();
//           setToken(null);
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } else {
//         console.log('[AuthProvider] Pas de token valide trouvé');
//         setToken(null);
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (err) {
//       console.error('[AuthProvider] load error', err);
//       setToken(null);
//       setUser(null);
//       setIsAuthenticated(false);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadTokenFromStorage();
//   }, [loadTokenFromStorage]);

//   const login = useCallback(async (newToken) => {
//     try {
//       if (!newToken) {
//         console.error('[AuthProvider] Token manquant pour la connexion');
//         return;
//       }
      
//       console.log('[AuthProvider] Tentative de connexion avec token:', !!newToken);
      
//       // Stocker le token
//       await AsyncStorage.setItem(TOKEN_KEY, newToken);
//       setToken(newToken);
      
//       // Décoder le token
//       const decoded = jwtDecode(newToken);
//       console.log('[AuthProvider] Token décodé:', decoded);
      
//       setUser(decoded);
//       setIsAuthenticated(true);
      
//       console.log('[AuthProvider] login -> success, isAuthenticated will be:', true);
//     } catch (err) {
//       console.error('[AuthProvider] login error', err);
//       // En cas d'erreur, nettoyer l'état
//       setToken(null);
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     console.log("[AuthProvider] logout -> removing token");
//     try {
//       await removeTokens();
      
//       setToken(null);
//       setUser(null);
//       setIsAuthenticated(false);
      
//       console.log("[AuthProvider] logout -> state cleared");
//     } catch (error) {
//       console.error("Erreur lors de la suppression du token :", error);
//     }
//   }, []);

//   // Enregistrer le callback de déconnexion pour axiosInstance
//   useEffect(() => {
//     setLogoutCallback(logout);
//   }, [logout]);

//   const value = useMemo(() => ({
//     token,
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     logout,
//   }), [token, user, isAuthenticated, loading, login, logout]);

//   console.log('[AuthProvider] Current state:', { isAuthenticated, loading, userExists: !!user });

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const styles = StyleSheet.create({
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });


// src/contexts/AuthProvider.js (secure store)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { storeToken, getToken, removeToken } from '../services/authStorage';
import { setLogoutCallback } from '../services/axiosInstance';
import { jwtDecode } from 'jwt-decode'; // ✅ Import correct

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Charger le token depuis SecureStore
  const loadTokenFromStorage = useCallback(async () => {
    try {
      const t = await getToken();
      console.log('[AuthProvider] loadTokenFromStorage ->', !!t);

      if (t && typeof t === 'string' && t.split('.').length === 3) {
        try {
          const decoded = jwtDecode(t);
          console.log('[AuthProvider] Token valide, utilisateur:', decoded);

          setToken(t);
          setUser(decoded);
          setIsAuthenticated(true);
        } catch (err) {
          console.warn('[AuthProvider] jwt decode failed', err);
          await removeToken();
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('[AuthProvider] Pas de token valide trouvé');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('[AuthProvider] load error', err);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokenFromStorage();
  }, [loadTokenFromStorage]);

  // ✅ Connexion (sauvegarde + décodage)
  const login = useCallback(async (newToken) => {
    const decoded = jwtDecode(newToken);
    console.log("[AuthProvider] exp:", new Date(decoded.exp * 1000));
    try {
      if (!newToken) {
        console.error('[AuthProvider] Token manquant pour la connexion');
        return;
      }

      console.log('[AuthProvider] Tentative de connexion avec token:', !!newToken);

      await storeToken(newToken);
      setToken(newToken);

      const decoded = jwtDecode(newToken);
      console.log('[AuthProvider] Token décodé:', decoded);

      setUser(decoded);
      setIsAuthenticated(true);

      console.log('[AuthProvider] login -> success, isAuthenticated will be:', true);
    } catch (err) {
      console.error('[AuthProvider] login error', err);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);




  // ✅ Déconnexion
  const logout = useCallback(async () => {
    console.log("[AuthProvider] logout -> removing token");
    try {
      await removeToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log("[AuthProvider] logout -> state cleared");
    } catch (error) {
      console.error("Erreur lors de la suppression du token :", error);
    }
  }, []);

  // ✅ Déconnexion automatique si axiosInstance rencontre un 401
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  }), [token, user, isAuthenticated, loading, login, logout]);

  console.log('[AuthProvider] Current state:', { isAuthenticated, loading, userExists: !!user });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
