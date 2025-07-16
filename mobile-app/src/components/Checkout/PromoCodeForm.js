import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const PromoCodeForm = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await onSubmit(code);
    } catch (err) {
      console.error(err);
      setError('Code promo invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-w-md mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <View className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Entrez votre code promo"
          editable={!loading}
          className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!code || loading}
          className={`px-4 py-2 rounded items-center justify-center ${
            !code || loading ? 'bg-blue-400 opacity-50' : 'bg-blue-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-medium">Appliquer</Text>
          )}
        </TouchableOpacity>
      </View>
      {error !== '' && <Text className="text-red-500 mt-2 text-sm">{error}</Text>}
    </View>
  );
};

export default PromoCodeForm;
