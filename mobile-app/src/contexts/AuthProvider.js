import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && typeof token === 'string' && token.split('.').length === 3) {
          const decoded = jwtDecode(token);
          setUser(decoded);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du token :", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (token) => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      setUser(null);
      setIsAuthenticated(false);
      console.error("Token JWT invalide :", token);
      return;
    }
    try {
      await AsyncStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      console.error("Erreur lors du décodage du token :", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error("Erreur lors de la suppression du token :", error);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
