import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/axiosInstance';
import WishlistList from '../../components/Wishlist/wishlist-list';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  
  const hasStock = wishlist.some((produit) => produit.stock > 0);

  useEffect(() => {
    loadWishlist();
  }, []);

  // Convert Blob to base64
  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/wishlist');

      // Charger les images blob pour chaque produit
      const wishlistWithImages = await Promise.all(
        res.data.map(async (product) => {
          if (product.image) {
            try {
              const blobRes = await axiosInstance.get(`/products/${product.id_produit}/image`, {
                responseType: 'blob',
              });
              const base64 = await blobToBase64(blobRes.data);
              return { ...product, image_url: base64 };
            } catch (err) {
              console.error("Erreur chargement image produit", product.id_produit, err);
              return product;
            }
          }
          return product;
        })
      );

      setWishlist(wishlistWithImages);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Vous devez être connecté pour accéder à votre wishlist.");
      } else if (err.response) {
        setError("Erreur lors du chargement de la wishlist. Veuillez réessayer.");
      } else {
        setError("Une erreur réseau s'est produite. Vérifiez votre connexion.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id_produit) => {
    try {
      await axiosInstance.delete(`/wishlist/delete/${id_produit}`);
      loadWishlist();
    } catch {
      Alert.alert("Erreur", "Erreur lors de la suppression du produit.");
    }
  };

  const handleClear = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir vider votre wishlist ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete('/wishlist/clear');
              loadWishlist();
            } catch {
              Alert.alert("Erreur", "Erreur lors du vidage de la wishlist.");
            }
          }
        }
      ]
    );
  };

  const handleAddToCart = async (id_produit) => {
    try {
      const produit = wishlist.find(p => p.id_produit === id_produit && Number(p.stock) > 0);

      if (!produit) {
        Alert.alert("Info", "Ce produit est en rupture de stock.");
        return;
      }

      await axiosInstance.post(`/wishlist/add_to_cart/${id_produit}`, {});
      Alert.alert("Succès", "Article ajouté au panier !");
      loadWishlist();
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'ajout au panier.");
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const produitsEnStock = wishlist.filter(p => Number(p.stock) > 0);

      if (produitsEnStock.length === 0) {
        Alert.alert("Info", "Aucun produit en stock à ajouter.");
        return;
      }

      await axiosInstance.post('/wishlist/add_all_to_cart', {});
      Alert.alert("Succès", "Articles ajoutés au panier !");
      loadWishlist();
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'ajout de tous les produits au panier.");
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-base text-gray-800 dark:text-gray-200">
            Chargement de votre wishlist...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 dark:text-red-400 text-base mb-3 text-center">
            {error}
          </Text>
          {error.includes("connecté") && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white text-base font-medium">Se connecter</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <Text className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Ma Wishlist
      </Text>

      {wishlist.length === 0 ? (
        <Text className="text-center text-base text-gray-600 dark:text-gray-400">
          Votre wishlist est vide
        </Text>
      ) : (
        <>
          {/* Liste des articles de la wishlist */}
          <WishlistList
            items={wishlist}
            onRemove={handleRemove}
            onAddToCart={handleAddToCart}
          />

          {/* Section Actions */}
          <View className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <Text className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white">
              Actions
            </Text>

            <View className="gap-3">
              {hasStock && (
                <TouchableOpacity
                  onPress={handleAddAllToCart}
                  className="bg-blue-600 dark:bg-blue-500 py-3.5 px-4 rounded-lg items-center"
                >
                  <Text className="text-white text-base font-semibold">
                    Ajouter tous les produits au panier
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleClear}
                className="bg-red-600 dark:bg-red-500 py-3.5 px-4 rounded-lg items-center"
              >
                <Text className="text-white text-base font-semibold">
                  Vider la wishlist
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}