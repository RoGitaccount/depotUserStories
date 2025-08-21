import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';  // <-- import useNavigation
import ScreenWrapper from '../../components/PageComponent/screenWrapper';
import axiosInstance from '../../services/axiosInstance';

export default function ForgotPassword() {
  const navigation = useNavigation(); // <-- hook navigation
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Format d'email invalide.")
      .max(255, "L'email ne doit pas dépasser 255 caractères.")
      .required("L'email est requis."),
  });

  const initialValues = { email: '' };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axiosInstance.post('/request-reset', {
        email: values.email,
      });

      setMessage(response.data.message);
      setError('');
      resetForm();
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full max-w-md bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-indigo-100 dark:border-gray-700">
            <Text className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">
              Réinitialiser le mot de passe
            </Text>

            {message !== '' && (
              <Text className="text-green-600 text-sm mb-4 text-center">{message}</Text>
            )}
            {error !== '' && (
              <Text className="text-pink-600 text-sm mb-4 text-center">{error}</Text>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <View className="space-y-6">
                  <View>
                    <TextInput
                      placeholder="Votre email"
                      placeholderTextColor={colorScheme.colorScheme === 'dark' ? '#A1A1AA' : '#6B7280'}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      maxLength={255}
                    />
                    {touched.email && errors.email && (
                      <Text className="text-pink-600 text-sm mt-1">{errors.email}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 dark:bg-indigo-500 py-3 rounded-lg shadow items-center"
                  >
                    <Text className="text-white font-semibold text-base">
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-2">
                    <Text className="text-indigo-500 dark:text-indigo-300 text-sm text-center">
                      Retour à la page de Connexion
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
