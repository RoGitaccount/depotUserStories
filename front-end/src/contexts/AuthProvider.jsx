// import React, { useState, useEffect } from 'react';
// import { AuthContext } from './AuthContext';

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user');

//     if (token && savedUser) {
//       try {
//         const parsedUser = JSON.parse(savedUser);
//         setUser(parsedUser);
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error("Erreur lors du parsing des données utilisateur :", error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     }
//     setLoading(false);
//   }, []);

//   // Dans le return du provider
//   if (loading) return <div>Chargement...</div>;

//   const login = (userData, token) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('user', JSON.stringify(userData));
//     setUser(userData);
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && typeof token === "string" && token.split('.').length === 3) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors du décodage du token :", error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Chargement...</div>;

const login = (token) => {
  if (!token || typeof token !== "string" || token.split('.').length !== 3) {
    setUser(null);
    setIsAuthenticated(false);
    console.error("Token JWT invalide :", token);
    return;
  }
  localStorage.setItem('token', token);
  try {
    const decoded = jwtDecode(token);
    setUser(decoded);
    setIsAuthenticated(true);
  } catch (error) {
    setUser(null);
    setIsAuthenticated(false);
    console.error("Erreur lors du décodage du token :", error);
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};