import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
      const res = await fetch('http://localhost:8001/api/category');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      // Gérer l'erreur
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8001/api/products');
      const data = await res.json();

      // Gestion des images blob
      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          if (product.image) {
            try {
              const blobRes = await fetch(`http://localhost:8001/api/products/${product.id_produit}/image`);
              const blob = await blobRes.blob();
              const imageUrl = URL.createObjectURL(blob);
              return { ...product, image_url: imageUrl };
            } catch {
              return product;
            }
          }
          return product;
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      // Gérer l'erreur
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8001/api/productCategory/categorie/${categoryId}`);
      const data = await res.json();

      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          if (product.image) {
            try {
              const blobRes = await fetch(`http://localhost:8001/api/products/${product.id_produit}/image`);
              const blob = await blobRes.blob();
              const imageUrl = URL.createObjectURL(blob);
              return { ...product, image_url: imageUrl };
            } catch {
              return product;
            }
          }
          return product;
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      // Gérer l'erreur
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
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id_produit })}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder} />
      )}
      <Text style={styles.productTitle}>{item.titre}</Text>
      <Text style={styles.productCategory}>
        {categories.find((c) => c.id_categorie === item.id_categorie)?.nom_categorie}
      </Text>
      <Text style={styles.productDescription}>{item.description}</Text>
      <Text style={styles.productPrice}>{item.prix} €</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategoryId === null && styles.categoryButtonSelected,
          ]}
          onPress={() => handleCategoryClick(null)}
        >
          <Text style={styles.categoryButtonText}>Toutes les catégories</Text>
        </TouchableOpacity>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.id_categorie.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategoryId === item.id_categorie && styles.categoryButtonSelected,
              ]}
              onPress={() => handleCategoryClick(item.id_categorie)}
            >
              <Text style={styles.categoryButtonText}>{item.nom_categorie}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <Text style={styles.title}>
        {selectedCategoryId
          ? `Catégorie : ${categories.find((c) => c.id_categorie === selectedCategoryId)?.nom_categorie}`
          : 'Tous les produits'}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 32 }} />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>Aucun produit trouvé.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id_produit.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.productsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', padding: 12 },
  categoriesContainer: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  categoryButton: { backgroundColor: '#e0e7ff', padding: 8, borderRadius: 8, marginRight: 8 },
  categoryButtonSelected: { backgroundColor: '#6366f1' },
  categoryButtonText: { color: '#222', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 18, marginTop: 32 },
  productsList: { paddingBottom: 16 },
  productCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 16, elevation: 2 },
  productImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  productImagePlaceholder: { width: '100%', height: 180, borderRadius: 8, backgroundColor: '#e0e0e0', marginBottom: 8 },
  productTitle: { fontSize: 16, fontWeight: 'bold' },
  productCategory: { fontSize: 13, color: '#6366f1', marginBottom: 4 },
  productDescription: { fontSize: 14, color: '#444', marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#22c55e' },
});