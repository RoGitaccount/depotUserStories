import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Picker,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetailScreen = () => {
  const route = useRoute();
  const { id } = route.params;

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);

  const [avis, setAvis] = useState([]);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  const [editId, setEditId] = useState(null);
  const [editNote, setEditNote] = useState(5);
  const [editCommentaire, setEditCommentaire] = useState("");

  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchProduit();
    fetchAvis();
  }, [id]);

  const fetchProduit = async () => {
    try {
      const res = await fetch(`http://localhost:8001/api/products/${id}`);
      const data = await res.json();

      if (data.image) {
        const imageRes = await fetch(`http://localhost:8001/api/products/${id}/image`);
        const blob = await imageRes.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          data.imageObjectUrl = reader.result;
          setProduit(data);
        };
        reader.readAsDataURL(blob);
      } else {
        setProduit(data);
      }
    } catch (error) {
      console.error("Erreur récupération produit :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvis = async () => {
    try {
      const res = await axios.get(`http://localhost:8001/api/reviews/${id}`);
      setAvis(res.data);
    } catch (error) {
      console.error("Erreur récupération avis :", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `http://localhost:8001/api/wishlist/add_to_cart/${produit.id_produit}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Succès", "Produit ajouté au panier !");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Ajout au panier échoué.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `http://localhost:8001/api/wishlist/add/${produit.id_produit}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Succès", "Produit ajouté à la wishlist !");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Ajout à la wishlist échoué.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour laisser un avis.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "http://localhost:8001/api/reviews/add-review",
        {
          id_produit: produit.id_produit,
          note,
          commentaire,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentaire("");
      setNote(5);
      fetchAvis();
      Alert.alert("Succès", "Avis envoyé !");
    } catch (error) {
      Alert.alert("Erreur", error.response?.data?.message || "Envoi échoué.");
    }
  };

  const handleDeleteReview = async (id_avis) => {
    Alert.alert("Confirmation", "Supprimer cet avis ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(
              `http://localhost:8001/api/reviews/delete-review/${id_avis}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAvis();
          } catch (error) {
            Alert.alert("Erreur", error.response?.data?.message || "Suppression échouée.");
          }
        },
      },
    ]);
  };

  const handleEditReview = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `http://localhost:8001/api/reviews/update-review/${editId}`,
        { note: editNote, commentaire: editCommentaire },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditId(null);
      fetchAvis();
    } catch (error) {
      Alert.alert("Erreur", error.response?.data?.message || "Modification échouée.");
    }
  };

  const canEditOrDelete = (avisItem) =>
    user && (user.id === avisItem.id_user || user.role === "admin");

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!produit) return <Text>Produit non trouvé</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{produit.titre}</Text>
      {produit.imageObjectUrl && (
        <Image source={{ uri: produit.imageObjectUrl }} style={styles.image} />
      )}
      <Text style={styles.description}>{produit.description}</Text>
      <Text style={styles.price}>{produit.prix} €</Text>

      <TouchableOpacity onPress={handleAddToCart} style={styles.buttonBlue}>
        <Text style={styles.buttonText}>Ajouter au panier</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAddToWishlist} style={styles.buttonPink}>
        <Text style={styles.buttonText}>Ajouter à la wishlist</Text>
      </TouchableOpacity>

      {isAuthenticated ? (
        <>
          <Text style={styles.sectionTitle}>Laisser un avis</Text>
          <Picker selectedValue={note} onValueChange={(value) => setNote(value)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Picker.Item key={n} label={`${n} étoile${n > 1 ? "s" : ""}`} value={n} />
            ))}
          </Picker>
          <TextInput
            placeholder="Votre commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={handleSubmitReview} style={styles.buttonGreen}>
            <Text style={styles.buttonText}>Envoyer l’avis</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.note}>Connectez-vous pour laisser un avis.</Text>
      )}

      <Text style={styles.sectionTitle}>Avis des clients</Text>
      {avis.map((a) => (
        <View key={a.id_avis} style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>
            {a.prenom || "Utilisateur"} - {a.note} / 5
          </Text>
          {editId === a.id_avis ? (
            <>
              <Picker selectedValue={editNote} onValueChange={(value) => setEditNote(value)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Picker.Item key={n} label={`${n} étoile${n > 1 ? "s" : ""}`} value={n} />
                ))}
              </Picker>
              <TextInput
                value={editCommentaire}
                onChangeText={setEditCommentaire}
                style={styles.input}
                multiline
              />
              <TouchableOpacity onPress={handleEditReview} style={styles.buttonGreen}>
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditId(null)} style={styles.buttonPink}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text>{a.commentaire}</Text>
              {canEditOrDelete(a) && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => {
                    setEditId(a.id_avis);
                    setEditNote(a.note);
                    setEditCommentaire(a.commentaire);
                  }}>
                    <Text style={styles.link}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteReview(a.id_avis)}>
                    <Text style={styles.linkRed}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  image: { width: "100%", height: 200, marginBottom: 10, borderRadius: 10 },
  description: { fontSize: 16, marginBottom: 10 },
  price: { fontSize: 20, color: "green", marginBottom: 10 },
  buttonBlue: {
    backgroundColor: "#2563eb",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonPink: {
    backgroundColor: "#db2777",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonGreen: {
    backgroundColor: "#16a34a",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    textAlignVertical: "top",
  },
  note: { fontStyle: "italic", marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  reviewCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  reviewTitle: { fontWeight: "bold", marginBottom: 5 },
  buttonRow: { flexDirection: "row", gap: 20, marginTop: 5 },
  link: { color: "#3b82f6", marginRight: 10 },
  linkRed: { color: "#dc2626" },
});

export default ProductDetailScreen;
