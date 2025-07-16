import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CartList from '../../components/Cart/CartList'; // ajuster le chemin si besoin
import CartSummary from '../../components/Cart/CartSummary'; // ajuster le chemin si besoin

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté pour accéder à votre panier.");
        setLoading(false);
        return;
      }

      const res = await axios.get('http://localhost:8001/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      const itemsWithImages = await Promise.all(
        data.map(async (item) => {
          try {
            const imageRes = await fetch(`http://localhost:8001/api/products/${item.id_produit}/image`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!imageRes.ok) throw new Error('Image non trouvée');
            const blob = await imageRes.blob();
            const imageUrl = URL.createObjectURL(blob);
            return { ...item, image: imageUrl };
          } catch {
            return { ...item, image: null };
          }
        })
      );

      setCartItems(itemsWithImages);
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Vous devez être connecté pour accéder à votre panier.");
      } else {
        setError("Erreur lors du chargement du panier. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id_produit) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `http://localhost:8001/api/cart/delete/${id_produit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadCart();
    } catch (err) {
      Alert.alert("Erreur", "Erreur lors de la suppression du produit.");
    }
  };

  const handleClearCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        'http://localhost:8001/api/cart/clear',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadCart();
    } catch (err) {
      Alert.alert("Erreur", "Erreur lors du vidage du panier.");
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {
      cartTotal: total,
      cartItems: cartItems,
    });
  };

  if (error === "Vous devez être connecté pour accéder à votre panier.") {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-600 text-lg mb-4">{error}</Text>
        <Button title="Se connecter" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-700">Chargement du panier...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6">
      <Text className="text-2xl font-bold text-center mb-6">Votre Panier</Text>

      {cartItems.length === 0 ? (
        <Text className="text-center text-lg">Votre panier est vide</Text>
      ) : (
        <>
          <CartList items={cartItems} onRemove={handleRemove} />

          <View className="mt-6">
            <CartSummary total={total} />

            <View className="mt-6 space-y-4">
              <TouchableOpacity
                className="bg-green-600 py-3 rounded"
                onPress={handleCheckout}
              >
                <Text className="text-white text-center text-lg">Procéder au paiement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-600 py-3 rounded"
                onPress={handleClearCart}
              >
                <Text className="text-white text-center text-lg">Vider le panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default CartScreen;
