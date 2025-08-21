// src/components/ProtectedRoute.js
import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigation = useNavigation();

  // // Vérifier l'authentification à chaque fois que l'écran est en focus
  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log('[ProtectedRoute] Focus - isAuthenticated:', isAuthenticated, 'loading:', loading);
      
  //     if (!loading && !isAuthenticated) {
  //       console.log('[ProtectedRoute] Redirection vers Login');
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: 'Login' }],
  //       });
  //     }
  //   }, [isAuthenticated, loading, navigation])
  // );

  useEffect(() => {
  console.log('[ProtectedRoute] Focus - isAuthenticated:', isAuthenticated, 'loading:', loading);
  if (!loading && !isAuthenticated) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
}, [loading, isAuthenticated, navigation]);


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProtectedRoute;