import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/axiosInstance';
import CartList from '../../components/Cart/CartList';
import CartSummary from '../../components/Cart/CartSummary';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';

export default function CartScreen() {
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
      const res = await axiosInstance.get('/cart');
      const data = res.data;

      const itemsWithImages = await Promise.all(
        data.map(async (item) => {
          try {
            const imageRes = await axiosInstance.get(`/products/${item.id_produit}/image`, {
              responseType: 'blob',
            });
            const blob = imageRes.data;
            const imageUrl = URL.createObjectURL(blob);
            return { ...item, image: imageUrl };
          } catch {
            return { ...item, image: null };
          }
        })
      );

      setCartItems(itemsWithImages);
      setTotal(data.reduce((sum, item) => sum + parseFloat(item.prix), 0));
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Vous devez être connecté pour accéder à votre panier.");
      } else {
        setError("Erreur lors du chargement du panier.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id_produit) => {
    try {
      await axiosInstance.delete(`/cart/delete/${id_produit}`);
      loadCart();
    } catch {
      Alert.alert("Erreur", "Erreur lors de la suppression du produit.");
    }
  };

  const handleClearCart = async () => {
    try {
      await axiosInstance.delete('/cart/clear');
      loadCart();
    } catch {
      Alert.alert("Erreur", "Erreur lors du vidage du panier.");
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {
      cartTotal: total,
      cartItems,
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 16 }}>Chargement du panier...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontSize: 16, marginBottom: 12 }}>{error}</Text>
          {error.includes("connecté") && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 6 }}
            >
              <Text style={{ color: '#fff' }}>Se connecter</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
        Votre Panier
      </Text>

      {cartItems.length === 0 ? (
        <Text style={{ textAlign: 'center', fontSize: 16 }}>Votre panier est vide</Text>
      ) : (
        <>
          <CartList items={cartItems} onRemove={handleRemove} />

          <View style={{ marginTop: 24 }}>
            <CartSummary total={total} />

            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#16a34a', padding: 14, borderRadius: 8, marginBottom: 12 }}
                onPress={handleCheckout}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Procéder au paiement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#dc2626', padding: 14, borderRadius: 8 }}
                onPress={handleClearCart}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Vider le panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}
