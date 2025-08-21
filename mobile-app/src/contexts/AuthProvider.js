// src/contexts/AuthProvider.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { removeTokens } from '../services/authStorage';
import { setLogoutCallback } from '../services/axiosInstance';
import { jwtDecode } from 'jwt-decode'; // ✅ Import correct
import { isTokenValid } from '../services/auth';

const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTokenFromStorage = useCallback(async () => {
    try {
      const t = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('[AuthProvider] loadTokenFromStorage ->', !!t);
      
      if (t && typeof t === 'string' && t.split('.').length === 3) {
        try {
          // ✅ Utiliser votre fonction isTokenValid existante
          const tokenIsValid = await isTokenValid();
          
          if (!tokenIsValid) {
            console.log('[AuthProvider] Token expiré, nettoyage...');
            await removeTokens();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            const decoded = jwtDecode(t);
            console.log('[AuthProvider] Token valide, utilisateur:', decoded);
            
            setToken(t);
            setUser(decoded);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.warn('[AuthProvider] jwt decode failed', err);
          await removeTokens();
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

  const login = useCallback(async (newToken) => {
    try {
      if (!newToken) {
        console.error('[AuthProvider] Token manquant pour la connexion');
        return;
      }
      
      console.log('[AuthProvider] Tentative de connexion avec token:', !!newToken);
      
      // Stocker le token
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      
      // Décoder le token
      const decoded = jwtDecode(newToken);
      console.log('[AuthProvider] Token décodé:', decoded);
      
      setUser(decoded);
      setIsAuthenticated(true);
      
      console.log('[AuthProvider] login -> success, isAuthenticated will be:', true);
    } catch (err) {
      console.error('[AuthProvider] login error', err);
      // En cas d'erreur, nettoyer l'état
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("[AuthProvider] logout -> removing token");
    try {
      await removeTokens();
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log("[AuthProvider] logout -> state cleared");
    } catch (error) {
      console.error("Erreur lors de la suppression du token :", error);
    }
  }, []);

  // Enregistrer le callback de déconnexion pour axiosInstance
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

// // src/contexts/AuthProvider.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { AuthContext } from './AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import jwtDecode from 'jwt-decode';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { removeTokens } from '../services/authStorage'; // Import de votre service

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
//         // Vérifier si le token n'est pas expiré
//         try {
//           const decoded = jwtDecode(t);
//           const currentTime = Date.now() / 1000;
          
//           if (decoded.exp && decoded.exp < currentTime) {
//             // Token expiré
//             console.log('[AuthProvider] Token expiré, nettoyage...');
//             await removeTokens();
//             setToken(null);
//             setUser(null);
//             setIsAuthenticated(false);
//           } else {
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
//       if (!newToken) return;
      
//       await AsyncStorage.setItem(TOKEN_KEY, newToken);
//       setToken(newToken);
      
//       const decoded = jwtDecode(newToken);
//       setUser(decoded);
//       setIsAuthenticated(true);
      
//       console.log('[AuthProvider] login -> success');
//     } catch (err) {
//       console.error('[AuthProvider] login error', err);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     console.log("[AuthProvider] logout -> removing token");
//     try {
//       // Utiliser votre service de suppression des tokens
//       await removeTokens();
      
//       // Mettre à jour immédiatement l'état
//       setToken(null);
//       setUser(null);
//       setIsAuthenticated(false);
      
//       console.log("[AuthProvider] logout -> state cleared");
//     } catch (error) {
//       console.error("Erreur lors de la suppression du token :", error);
//     }
//   }, []);

//   const value = useMemo(() => ({
//     token,
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     logout,
//   }), [token, user, isAuthenticated, loading, login, logout]);

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


// // src/contexts/AuthProvider.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { AuthContext } from './AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import jwtDecode from 'jwt-decode'; // IMPORTANT: import par défaut
// import { View, ActivityIndicator, StyleSheet } from 'react-native';

// const TOKEN_KEY = 'token'; // assure-toi que ça correspond à authStorage.js

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const loadTokenFromStorage = useCallback(async () => {
//     try {
//       const t = await AsyncStorage.getItem(TOKEN_KEY);
//       // debug log
//       console.log('[AuthProvider] loadTokenFromStorage ->', !!t);
//       if (t && typeof t === 'string' && t.split('.').length === 3) {
//         setToken(t);
//         try {
//           const decoded = jwtDecode(t);
//           setUser(decoded);
//           setIsAuthenticated(true);
//         } catch (err) {
//           console.warn('[AuthProvider] jwt decode failed', err);
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } else {
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
//       if (!newToken) return;
//       await AsyncStorage.setItem(TOKEN_KEY, newToken);
//       setToken(newToken);
//       const decoded = jwtDecode(newToken);
//       setUser(decoded);
//       setIsAuthenticated(true);
//       console.log('[AuthProvider] login -> success');
//     } catch (err) {
//       console.error('[AuthProvider] login error', err);
//     }
//   }, []);

// const logout = async () => {
//   console.log("[AuthProvider] logout -> removing token");
//   try {
//     await AsyncStorage.removeItem('token');
//     await AsyncStorage.clear(); // 👈 pour être sûr en dev
//   } catch (error) {
//     console.error("Erreur lors de la suppression du token :", error);
//   }
//   setUser(null);
//   setIsAuthenticated(false);
//   console.log("[AuthProvider] logout -> state cleared");
// };


//   const value = useMemo(() => ({
//     token,
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     logout,
//   }), [token, user, isAuthenticated, loading, login, logout]);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   return (
// <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
//   {children}
// </AuthContext.Provider>

//   );
// };

// const styles = StyleSheet.create({
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });



// import React, { useState, useEffect, useCallback } from 'react';
// import { AuthContext } from './AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Fonction pour vérifier le token
//   const checkAuth = useCallback(async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (token && typeof token === 'string' && token.split('.').length === 3) {
//         const decoded = jwtDecode(token);
//         setUser(decoded);
//         setIsAuthenticated(true);
//       } else {
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error("Erreur lors de la vérification du token :", error);
//       setUser(null);
//       setIsAuthenticated(false);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Chargement initial
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   // Login
//   const login = async (token) => {
//     if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
//       console.error("Token JWT invalide :", token);
//       return;
//     }
//     try {
//       await AsyncStorage.setItem('token', token);
//       await checkAuth(); // Vérifie immédiatement après login
//     } catch (error) {
//       console.error("Erreur lors du stockage du token :", error);
//     }
//   };

//   // Logout
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       await checkAuth(); // Vérifie immédiatement après logout
//     } catch (error) {
//       console.error("Erreur lors de la suppression du token :", error);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const styles = StyleSheet.create({
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });








// import React, { useState, useEffect } from 'react';
// import { AuthContext } from './AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token && typeof token === 'string' && token.split('.').length === 3) {
//           const decoded = jwtDecode(token);
//           setUser(decoded);
//           setIsAuthenticated(true);
//         } else {
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } catch (error) {
//         console.error("Erreur lors du chargement du token :", error);
//         setUser(null);
//         setIsAuthenticated(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadToken();
//   }, []);

//   const login = async (token) => {
//     if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
//       setUser(null);
//       setIsAuthenticated(false);
//       console.error("Token JWT invalide :", token);
//       return;
//     }
//     try {
//       await AsyncStorage.setItem('token', token);
//       const decoded = jwtDecode(token);
//       setUser(decoded);
//       setIsAuthenticated(true);
//     } catch (error) {
//       setUser(null);
//       setIsAuthenticated(false);
//       console.error("Erreur lors du décodage du token :", error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//     } catch (error) {
//       console.error("Erreur lors de la suppression du token :", error);
//     }
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const styles = StyleSheet.create({
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
