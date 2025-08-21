import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/PageComponent/screenWrapper';

export default function AccueilScreen() {
  const navigation = useNavigation();

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Page d'Accueil (publique)
        </Text>

        <TouchableOpacity
          className="bg-green-500 px-8 py-4 rounded-lg"
          onPress={() => navigation.navigate('Cart')}
        >
          <Text className="text-white font-bold text-lg">Voir mon panier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-600 px-8 py-4 rounded-lg mt-3"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-white font-bold text-lg">Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-orange-400 px-8 py-4 rounded-lg mt-3"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-white font-bold text-lg">S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-purple-600 px-8 py-4 rounded-lg mt-3"
          onPress={() => navigation.navigate('Catalog')}
        >
          <Text className="text-white font-bold text-lg">Catalogue</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
