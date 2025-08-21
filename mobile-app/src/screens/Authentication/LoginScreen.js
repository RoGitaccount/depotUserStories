import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/login', { email, password }); // ← Utilise l'instance ici
      Alert.alert('Succès', 'Code envoyé par email. Vérifiez votre boîte mail.');
      navigation.navigate('VerifyCodeLogin', { email });
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Connexion à votre compte</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'En cours...' : 'Se connecter'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
     </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', maxWidth: 350, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#6366f1', padding: 14, borderRadius: 8, width: '100%', maxWidth: 350, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#2563eb', marginTop: 8, fontSize: 15 },
});



// import React from 'react';
// import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import axiosInstance from '../../services/axiosInstance';
// import Toast from 'react-native-toast-message';
// import { useNavigation } from '@react-navigation/native';

// export default function LoginScreen() {
//   const navigation = useNavigation();

//   const validationSchema = Yup.object({
//     email: Yup.string()
//       .email("Format d'email invalide.")
//       .max(255, "L'email ne doit pas dépasser 255 caractères.")
//       .required("L'email est requis."),
//     password: Yup.string()
//       .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
//       .max(255)
//       .required('Le mot de passe est requis.'),
//   });

//   const initialValues = { email: '', password: '', rememberMe: false };

//   const onSubmit = async (values, { setSubmitting }) => {
//     try {
//       const payload = {
//         email: values.email,
//         password: values.password,
//         rememberMe: values.rememberMe,
//       };
//       await axiosInstance.post('/login', payload);

//       Toast.show({
//         type: 'success',
//         text1: 'Connexion réussie',
//         text2: 'Code envoyé par email.',
//       });

//       navigation.navigate('VerifyCodeLogin', {
//         email: values.email,
//         rememberMe: values.rememberMe,
//       });
//     } catch (error) {
//       console.log("🔥 Erreur complète:", error);
//       Toast.show({
//         type: 'error',
//         text1: 'Erreur',
//         text2:
//           error?.response?.data?.message ||
//           error?.message ||
//           'Erreur inconnue lors de la connexion.',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-4">
//       <View className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-gray-700">
//         <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
//           {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
//             <View className="space-y-4">
//               <Text className="text-2xl text-center font-bold text-indigo-700 dark:text-indigo-200 mb-4">Connexion à votre compte</Text>

//               <View>
//                 <TextInput
//                   className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-3"
//                   placeholder="Email"
//                   keyboardType="email-address"
//                   onChangeText={handleChange('email')}
//                   onBlur={handleBlur('email')}
//                   value={values.email}
//                   maxLength={255}
//                 />
//                 {touched.email && errors.email && (
//                   <Text className="text-pink-600 text-sm mt-1">{errors.email}</Text>
//                 )}
//               </View>

//               <View>
//                 <TextInput
//                   className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-3"
//                   placeholder="Mot de passe"
//                   secureTextEntry
//                   onChangeText={handleChange('password')}
//                   onBlur={handleBlur('password')}
//                   value={values.password}
//                   maxLength={255}
//                 />
//                 {touched.password && errors.password && (
//                   <Text className="text-pink-600 text-sm mt-1">{errors.password}</Text>
//                 )}
//               </View>

//               {/* Case à cocher maison */}
//               <TouchableOpacity
//                 onPress={() => setFieldValue('rememberMe', !values.rememberMe)}
//                 className="flex-row items-center"
//                 style={{ marginVertical: 10 }}
//               >
//                 <View style={{
//                   width: 20,
//                   height: 20,
//                   borderWidth: 1,
//                   borderColor: '#4f46e5',
//                   backgroundColor: values.rememberMe ? '#4f46e5' : 'transparent',
//                   marginRight: 8,
//                   borderRadius: 3,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}>
//                   {values.rememberMe && (
//                     <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
//                   )}
//                 </View>
//                 <Text className="text-gray-700 dark:text-gray-200">Rester connecté</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={handleSubmit}
//                 disabled={isSubmitting}
//                 className="bg-gradient-to-r from-indigo-500 to-pink-500 py-3 rounded-lg"
//               >
//                 {isSubmitting ? (
//                   <ActivityIndicator color="white" />
//                 ) : (
//                   <Text className="text-black dark:text-white text-center font-semibold">Se connecter</Text>
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
//                 <Text className="text-indigo-500 text-sm text-center mt-2">Mot de passe oublié ?</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </Formik>
//       </View>

//       <Toast />
//     </View>
//   );
// }
