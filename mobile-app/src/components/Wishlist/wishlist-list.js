import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WishlistList = ({ items = [], onRemove, onAddToCart }) => {
  const navigation = useNavigation();

  if (!items || items.length === 0) {
    return (
      <View className="mt-6">
        <Text className="text-center text-lg text-gray-600 dark:text-gray-400">
          Votre wishlist est vide
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      {items.map((item) => (
        <View
          key={item.id_produit}
          className="flex-row items-start gap-4 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm"
        >
          {/* Image du produit */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}
            className="active:opacity-70"
          >
            <Image
              source={{ uri: item.image_url }}
              className="w-28 h-28 rounded-lg border border-gray-300 dark:border-gray-600"
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Informations du produit */}
          <View className="flex-1 gap-2">
            {/* Titre */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}
              className="active:opacity-70"
            >
              <Text className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {item.titre}
              </Text>
            </TouchableOpacity>

            {/* Prix */}
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {item.prix} €
            </Text>

            {/* Date d'ajout */}
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Ajouté le : {new Date(item.date_ajout).toLocaleDateString()}
            </Text>

            {/* Boutons d'action */}
            <View className="flex-row gap-3 mt-3 flex-wrap">
              {/* Bouton Ajouter au panier ou Rupture de stock */}
              {Number(item.stock) > 0 ? (
                <TouchableOpacity
                  onPress={() => onAddToCart(item.id_produit)}
                  className="flex-row items-center bg-green-600 dark:bg-green-500 px-4 py-2.5 rounded-md gap-2 active:opacity-80"
                >
                  <Text className="text-white text-sm font-medium">
                    🛒 Ajouter au panier
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-md border border-red-300 dark:border-red-700 gap-1.5">
                  <Text className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    ❌ Rupture de stock
                  </Text>
                </View>
              )}

              {/* Bouton Supprimer */}
              <TouchableOpacity
                onPress={() => onRemove(item.id_produit)}
                className="bg-red-600 dark:bg-red-500 px-4 py-2.5 rounded-md active:opacity-80"
              >
                <Text className="text-white text-sm font-medium text-center">
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default WishlistList;