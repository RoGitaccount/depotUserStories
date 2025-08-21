// auth.js
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUserIdFromToken() {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.id_user || decoded.id;
  } catch {
    return null;
  }
}

export async function isTokenValid() {
  const token = await AsyncStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// ✅ AJOUT : Fonction pour décoder le token et récupérer les infos utilisateur
export async function getUserFromToken() {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
}

// ✅ AJOUT : Fonction pour vérifier si un token spécifique est valide (sans AsyncStorage)
export function isSpecificTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}