// //avec AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const TOKEN_KEY = 'token';
// const REFRESH_TOKEN_KEY = 'refreshToken';

// export const storeTokens = async (token, refreshToken) => {
//   try {
//     if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
//     if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
//   } catch (error) {
//     console.error('Erreur lors de la sauvegarde des tokens:', error);
//   }
// };

// export const getToken = async () => {
//   try {
//     return await AsyncStorage.getItem(TOKEN_KEY);
//   } catch (error) {
//     console.error('Erreur lors de la récupération du token:', error);
//     return null;
//   }
// };

// export const getRefreshToken = async () => {
//   try {
//     return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
//   } catch (error) {
//     console.error('Erreur lors de la récupération du refresh token:', error);
//     return null;
//   }
// };

// export const removeTokens = async () => {
//   try {
//     await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
//   } catch (error) {
//     console.error('Erreur lors de la suppression des tokens:', error);
//   }
// };


// avec secure store

// services/authStorage.js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';

export const storeToken = async (token) => {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
  }
};

// ✅ Ajout pour compatibilité avec ton ancien code
export const storeTokens = async (token) => {
  return storeToken(token);
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
  }
};
