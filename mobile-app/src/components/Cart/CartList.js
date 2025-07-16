import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CartList = ({ items = [], onRemove }) => {
  const navigation = useNavigation();

  if (!items || items.length === 0) {
    return (
      <View className="mt-6">
        <Text className="text-center text-lg">Votre panier est vide</Text>
      </View>
    );
  }

  return (
    <ScrollView className="space-y-6">
      {items.map((item) => (
        <View
          key={item.id_produit}
          className="flex-row items-start gap-4 border-b border-gray-300 bg-white p-4 rounded"
        >
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}>
            <Image
              source={{ uri: item.image }}
              className="w-28 h-28 rounded border border-gray-300"
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View className="flex-1 space-y-2">
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}>
              <Text className="text-xl font-semibold text-blue-600">{item.titre}</Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold text-gray-800">{item.prix} €</Text>
            <Text className="text-sm text-gray-600">
              Ajouté le : {new Date(item.date_ajout).toLocaleDateString()}
            </Text>

            <TouchableOpacity
              onPress={() => onRemove(item.id_produit)}
              className="bg-red-600 px-4 py-2 rounded mt-2"
            >
              <Text className="text-white text-center">Supprimer du panier</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default CartList;
