import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NavbarNative from '../components/PageComponent/Navbar';

export default function AccueilScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <NavbarNative />
      <View style={styles.container}>
        <Text style={styles.title}>Page d'Accueil (publique)</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.buttonText}>Voir mon panier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2563eb', marginTop: 12 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f59e42', marginTop: 12 }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 24 },
  title: { fontSize: 28, marginBottom: 32, fontWeight: 'bold' },
  button: { backgroundColor: '#22c55e', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
