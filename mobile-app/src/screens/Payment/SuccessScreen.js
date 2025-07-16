import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const alreadyProcessed = useRef(false);

  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    const processOrder = async () => {
      if (alreadyProcessed.current) return;
      alreadyProcessed.current = true;

      try {
        // Récupérer session_id depuis les params de navigation
        const sessionId = route.params?.session_id;
        if (!sessionId) {
          throw new Error('Session ID manquant');
        }

        await axios.post(
          'http://localhost:8001/api/order/process-success',
          { sessionId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem?.('token') || ''}`, // localStorage n'existe pas en RN, voir remarque
            },
          }
        );

        setLoading(false);

        // Rediriger après 5 secondes
        setTimeout(() => {
          navigation.navigate('Home'); // 'Home' est le nom de ta page d'accueil dans React Navigation
        }, 5000);
      } catch (err) {
        console.error('Erreur lors du traitement de la commande:', err);
        setError('Une erreur est survenue lors du traitement de votre commande.');
        setLoading(false);
      }
    };

    processOrder();
  }, [route.params, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.title}>Traitement de votre commande...</Text>
        <Text>Veuillez patienter pendant que nous finalisons votre commande.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorText}>
          <Text style={{ fontWeight: 'bold' }}>
            votre paiement a bien été validé par notre prestataire mais n’a pas pu être enregistré dans notre système.
          </Text>
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>
            Un remboursement automatique sera effectué sous peu.
          </Text>
          {'\n'}
          Merci de vous reconnecter et de réessayer, ou contactez le support si besoin.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commande confirmée !</Text>
      <Text>Merci pour votre achat.</Text>
      <Text>Vous allez être redirigé vers la page d'accueil dans quelques secondes...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2', // rouge clair
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6366F1', // indigo-500
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#b91c1c', // rouge foncé
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default SuccessPage;
