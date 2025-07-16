import React from 'react';
import { View, Text } from 'react-native';

const CartSummary = ({ total = 0, reduction = 0, reductionPercent = 0 }) => {
  const TVA = 0.2;
  const sousTotal = total;
  const montantTVA = sousTotal * TVA;
  const prixTTC = sousTotal + montantTVA;
  const prixTTCAvecPromo = (sousTotal - reduction) * (1 + TVA);

  return (
    <View className="mx-auto p-6 bg-white rounded-lg shadow-md w-11/12">
      <Text className="text-xl font-bold mb-4">Résumé de la commande</Text>

      <View className="flex-row justify-between py-1 border-b border-gray-300">
        <Text>Sous-total (HT)</Text>
        <Text>{sousTotal.toFixed(2)}€</Text>
      </View>

      <View className="flex-row justify-between py-1 border-b border-gray-300">
        <Text>TVA (20%)</Text>
        <Text>{montantTVA.toFixed(2)}€</Text>
      </View>

      <View className="flex-row justify-between py-1 border-b border-gray-300">
        <Text>Prix TTC (sans promo)</Text>
        <Text>{prixTTC.toFixed(2)}€</Text>
      </View>

      {reduction > 0 && (
        <>
          <View className="flex-row justify-between py-1 border-b border-gray-300">
            <Text className="text-red-600">Réduction ({reductionPercent}%)</Text>
            <Text className="text-red-600">-{reduction.toFixed(2)}€</Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="font-semibold text-green-700">Prix TTC avec promo</Text>
            <Text className="font-semibold text-green-700">{prixTTCAvecPromo.toFixed(2)}€</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default CartSummary;
