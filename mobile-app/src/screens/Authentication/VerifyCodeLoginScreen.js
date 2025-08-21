// // src/screens/VerifyCodeLoginScreen.js
// import React, { useState, useContext } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import axiosInstance from '../../services/axiosInstance';
// import { storeTokens } from '../../services/authStorage';
// import { AuthContext } from '../../contexts/AuthContext';

// export default function VerifyCodeLoginScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { login } = useContext(AuthContext); // Utiliser le contexte
//   const [email, setEmail] = useState(route.params?.email || '');
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleVerify = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.post('/verify', { email, code });
//       const token = response.data.token;
//       const refreshToken = response.data.refreshToken;

//       // Juste après la réponse de l'API
//         console.log('Response data:', response.data);
//         console.log('Token reçu:', token);
//         console.log('Type du token:', typeof token);

//       if (token) {
//         // Stocker les tokens ET mettre à jour le contexte
//         await storeTokens(token, refreshToken);
//         await login(token); // Mettre à jour le contexte d'authentification
        
//         Alert.alert('Succès', 'Connexion réussie !');
        
//         // Navigation avec reset pour éviter de pouvoir revenir en arrière
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'Dashboard' }],
//         });
//       } else {
//         Alert.alert('Erreur', 'Token manquant dans la réponse.');
//       }
//     } catch (error) {
//       Alert.alert('Erreur', error.response?.data?.message || 'Erreur de vérification.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900 px-6">
//       <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
//         Vérification du code
//       </Text>
      
//       <Text className="w-full max-w-md p-3 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
//         {email}
//       </Text>
      
//       <TextInput
//         className="w-full max-w-md border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
//         placeholder="Code de vérification"
//         value={code}
//         onChangeText={(text) => {
//           const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
//           setCode(filtered);
//         }}
//         keyboardType="number-pad"
//         maxLength={6}
//         placeholderTextColor="#9ca3af"
//       />
      
//       <TouchableOpacity
//         className="w-full max-w-md bg-indigo-600 rounded-lg py-4 items-center mb-3 disabled:opacity-50"
//         onPress={handleVerify}
//         disabled={loading}
//         activeOpacity={0.8}
//       >
//         {loading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text className="text-white font-bold text-lg">Vérifier</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }


// src/screens/VerifyCodeLoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axiosInstance from '../../services/axiosInstance';
import { storeTokens } from '../../services/authStorage';
import { AuthContext } from '../../contexts/AuthContext';

export default function VerifyCodeLoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useContext(AuthContext); // Utiliser le contexte
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      console.log('[VerifyCode] Envoi de la vérification...', { email, code });
      
      const response = await axiosInstance.post('/verify', { email, code });
      const token = response.data.token;
      const refreshToken = response.data.refreshToken;

      console.log('[VerifyCode] Réponse reçue:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenType: typeof token
      });

      if (token) {
        console.log('[VerifyCode] Stockage des tokens...');
        await storeTokens(token, refreshToken);
        
        console.log('[VerifyCode] Tokens stockés, mise à jour du contexte...');
        await login(token);
        
        // ✅ Attendre un peu pour que le contexte se mette à jour
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[VerifyCode] Contexte mis à jour, navigation...');
        Alert.alert('Succès', 'Connexion réussie !', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            }
          }
        ]);
      } else {
        console.error('[VerifyCode] Pas de token dans la réponse:', response.data);
        Alert.alert('Erreur', 'Token manquant dans la réponse.');
      }
    } catch (error) {
      console.error('[VerifyCode] Erreur complète:', error);
      console.error('[VerifyCode] Réponse erreur:', error.response?.data);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur de vérification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900 px-6">
      <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Vérification du code
      </Text>
      
      <Text className="w-full max-w-md p-3 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
        {email}
      </Text>
      
      <TextInput
        className="w-full max-w-md border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Code de vérification"
        value={code}
        onChangeText={(text) => {
          const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
          setCode(filtered);
        }}
        keyboardType="number-pad"
        maxLength={6}
        placeholderTextColor="#9ca3af"
      />
      
      <TouchableOpacity
        className="w-full max-w-md bg-indigo-600 rounded-lg py-4 items-center mb-3 disabled:opacity-50"
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Vérifier</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}