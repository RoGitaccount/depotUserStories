import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyCodeLoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [email, setEmail] = useState(route.params?.emailToVerify || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

 const handleVerify = async () => {
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:8001/api/verify', { email, code });
    console.log('Token reçu:', response.data.token);
    console.log('User reçu:', response.data.user);
    // Supposons que le token est dans response.data.token
    const token = response.data.token;
    if (token) {
      await AsyncStorage.setItem('token', token);
      Alert.alert('Succès', 'Connexion réussie !');
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Erreur', "Token manquant dans la réponse.");
    }
  } catch (error) {
    Alert.alert('Erreur', error.response?.data?.message || 'Erreur de vérification.');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification du code</Text>
      <TextInput
        style={styles.input}
        placeholder="Votre email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Code de vérification"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Vérification...' : 'Vérifier'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', maxWidth: 350, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#6366f1', padding: 14, borderRadius: 8, width: '100%', maxWidth: 350, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});