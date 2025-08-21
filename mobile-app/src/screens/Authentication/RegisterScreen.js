import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function RegisterScreen() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepteConditions, setAccepteConditions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!prenom || !nom || !email || !password) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }
    if (!accepteConditions) {
      Alert.alert('Erreur', 'Vous devez accepter la politique de confidentialité.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://10.81.147.85:8001/api/signup', {
        prenom,
        nom,
        email,
        password,
        role: 'user',
      });
      Alert.alert('Succès', 'Inscription réussie !');
      setPrenom('');
      setNom('');
      setEmail('');
      setPassword('');
      setAccepteConditions(false);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={prenom}
        onChangeText={setPrenom}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[styles.checkbox, accepteConditions && styles.checkboxChecked]}
          onPress={() => setAccepteConditions(!accepteConditions)}
        >
          {accepteConditions && <Text style={styles.checkboxTick}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>
          J'accepte la politique de confidentialité.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'En cours...' : "S'inscrire"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', maxWidth: 350, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#f59e42', padding: 14, borderRadius: 8, width: '100%', maxWidth: 350, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkboxTick: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxLabel: { fontSize: 15 },
});