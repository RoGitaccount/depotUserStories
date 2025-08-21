import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/axiosInstance';
import { getToken } from '../../services/authStorage';

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
        const sessionId = route.params?.session_id;
        if (!sessionId) {
          throw new Error('Session ID manquant');
        }

        const token = await getToken();
        if (!token) throw new Error('Token manquant');

        await axiosInstance.post(
          '/order/process-success',
          { sessionId }
        );

        setLoading(false);

        setTimeout(() => {
          navigation.navigate('Accueil');
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
      
        <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-5">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-2xl font-bold text-indigo-500 dark:text-indigo-400 mt-4">
            Traitement de votre commande...
          </Text>
          <Text className="text-center text-gray-700 dark:text-gray-300 mt-2">
            Veuillez patienter pendant que nous finalisons votre commande.
          </Text>
        </View>
      
    );
  }

  if (error) {
    return (
      
        <View className="flex-1 justify-center items-center bg-red-100 dark:bg-red-900 px-5">
          <Text className="text-2xl font-bold text-red-700 dark:text-red-300 mb-3">
            Erreur
          </Text>
          <Text className="text-base text-red-700 dark:text-red-200 text-center mb-2">
            {error}
          </Text>
          <Text className="text-base text-red-700 dark:text-red-200 text-center font-semibold">
            Votre paiement a bien été validé par notre prestataire mais n’a pas pu être enregistré dans notre système.
            {"\n\n"}
            Un remboursement automatique sera effectué sous peu.
            {"\n\n"}
            Merci de vous reconnecter et de réessayer, ou contactez le support si besoin.
          </Text>
        </View>
      
    );
  }

  return (
    
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-5">
        <Text className="text-2xl font-bold text-indigo-500 dark:text-indigo-400 mb-2">
          Commande confirmée !
        </Text>
        <Text className="text-center text-gray-700 dark:text-gray-300">
          Merci pour votre achat.
        </Text>
        <Text className="text-center text-gray-700 dark:text-gray-300 mt-2">
          Vous allez être redirigé vers la page d'accueil dans quelques secondes...
        </Text>
      </View>
  );
};

export default SuccessPage;
