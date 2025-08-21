import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/axiosInstance';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';


  // Convert Blob to base64
  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

export default function CatalogueScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/category');
      setCategories(res.data);
    } catch (error) {
      console.error('Erreur récupération catégories :', error);
    }
  };

  const loadImagesBase64 = async (productsArray) => {
  const productsWithBase64 = await Promise.all(
    productsArray.map(async (prod) => {
      if (prod.image_url || prod.image) {
        try {
          // Utilisez un endpoint dédié comme dans ProductDetailScreen
          const res = await axiosInstance.get(`/products/${prod.id_produit}/image`, {
            responseType: 'blob',
          });
          const base64 = await blobToBase64(res.data);
          return { ...prod, image_url: base64 };
        } catch (error) {
          console.error('Erreur chargement image:', error);
          return { ...prod, image_url: null };
        }
      }
      return prod;
    })
  );
  return productsWithBase64;
};


   const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/products');
      const productsBase64 = await loadImagesBase64(res.data);
      setProducts(productsBase64);
    } catch (error) {
      console.error('Erreur récupération produits :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/productCategory/categorie/${categoryId}`);
      const productsBase64 = await loadImagesBase64(res.data);
      setProducts(productsBase64);
    } catch (error) {
      console.error('Erreur récupération produits par catégorie :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === null) {
      fetchAllProducts();
    } else {
      fetchProductsByCategory(categoryId);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-md"
      onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-44 rounded-lg mb-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-44 rounded-lg bg-gray-300 dark:bg-gray-700 mb-3" />
      )}
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {item.titre}
      </Text>
      <Text className="text-sm text-indigo-500 mb-1">
        {categories.find((c) => c.id_categorie === item.id_categorie)?.nom_categorie}
      </Text>
      <Text className="text-base text-gray-700 dark:text-gray-300 mb-1">
        {item.description}
      </Text>
      <Text className="text-lg font-bold text-green-600 dark:text-green-400">
        {item.prix} €
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scrollable={false}>
    <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-3">
      <View className="flex-row mb-3 items-center">
        <TouchableOpacity
          className={`px-3 py-2 rounded-lg mr-3 ${
            selectedCategoryId === null
              ? 'bg-indigo-600'
              : 'bg-indigo-200 dark:bg-indigo-700'
          }`}
          onPress={() => handleCategoryClick(null)}
        >
          <Text
            className={`font-bold ${
              selectedCategoryId === null
                ? 'text-white'
                : 'text-indigo-900 dark:text-indigo-200'
            }`}
          >
            Toutes les catégories
          </Text>
        </TouchableOpacity>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id_categorie.toString()}
              className={`px-3 py-2 rounded-lg mr-3 ${
                selectedCategoryId === item.id_categorie
                  ? 'bg-indigo-600'
                  : 'bg-indigo-200 dark:bg-indigo-700'
              }`}
              onPress={() => handleCategoryClick(item.id_categorie)}
            >
              <Text
                className={`font-bold ${
                  selectedCategoryId === item.id_categorie
                    ? 'text-white'
                    : 'text-indigo-900 dark:text-indigo-200'
                }`}
              >
                {item.nom_categorie}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {selectedCategoryId
          ? `Catégorie : ${categories.find((c) => c.id_categorie === selectedCategoryId)?.nom_categorie}`
          : 'Tous les produits'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" className="mt-8" />
      ) : products.length === 0 ? (
        <Text className="text-center text-lg text-gray-700 dark:text-gray-300 mt-8">
          Aucun produit trouvé.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id_produit.toString()}
          renderItem={renderProduct}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
    </ScreenWrapper>
  );
}
