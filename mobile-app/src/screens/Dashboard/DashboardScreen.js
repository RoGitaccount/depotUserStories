import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';

const roleLabels = {
  user: "Utilisateur",
  admin: "Administrateur",
  manager: "Gestionnaire"
};

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log('Token lu:', token);
      if (!token) {
        setError("Vous devez être connecté pour accéder à votre tableau de bord.");
        setLoading(false);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        console.log('Token décodé:', decoded);
        setUser(decoded);
      } catch (err) {
        console.log('Erreur décodage token:', err);
        await AsyncStorage.removeItem("token");
        setError("Token invalide. Veuillez vous reconnecter.");
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue sur votre tableau de bord</Text>
        <Text style={styles.info}><Text style={styles.label}>Nom :</Text> {user.nom}</Text>
        <Text style={styles.info}><Text style={styles.label}>Prénom :</Text> {user.prenom}</Text>
        <Text style={styles.info}><Text style={styles.label}>Email :</Text> {user.email}</Text>
        <Text style={styles.info}><Text style={styles.label}>Rôle :</Text> {roleLabels[user.role] || user.role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 24, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  info: { fontSize: 16, marginBottom: 8 },
  label: { fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  errorText: { color: '#e53e3e', fontSize: 16, marginBottom: 16, textAlign: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  loginButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 6 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});