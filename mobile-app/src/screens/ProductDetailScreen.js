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
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Import corrigé
import axiosInstance from "../services/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import { useRoute } from "@react-navigation/native";
import ScreenWrapper from "../components/PageComponent/screenWrapper";

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

  // Convert Blob to base64
  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const fetchProduit = async () => {
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);

      if (data.image) {
        // récupérer l'image en blob, puis en base64 pour React Native
        const imageRes = await axiosInstance.get(`/products/${id}/image`, {
          responseType: "blob",
        });
        const base64 = await blobToBase64(imageRes.data);
        data.imageObjectUrl = base64;
      }

      setProduit(data);
    } catch (error) {
      console.error("Erreur récupération produit :", error);
      Alert.alert("Erreur", "Impossible de récupérer le produit.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvis = async () => {
    try {
      const res = await axiosInstance.get(`/reviews/${id}`);
      setAvis(res.data);
    } catch (error) {
      console.error("Erreur récupération avis :", error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert("Erreur", "Vous devez être connecté pour ajouter au panier.");
      return;
    }
    try {
      await axiosInstance.post(`/wishlist/add_to_cart/${produit.id_produit}`, {});
      Alert.alert("Succès", "Produit ajouté au panier !");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", error.response?.data?.message || "Ajout au panier échoué.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      Alert.alert("Erreur", "Vous devez être connecté pour ajouter à la wishlist.");
      return;
    }
    try {
      await axiosInstance.post(`/wishlist/add/${produit.id_produit}`, {});
      Alert.alert("Succès", "Produit ajouté à la wishlist !");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", error.response?.data?.message || "Ajout à la wishlist échoué.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour laisser un avis.");
      return;
    }
    if (!commentaire.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un commentaire.");
      return;
    }
    try {
      await axiosInstance.post("/reviews/add-review", {
        id_produit: produit.id_produit,
        note,
        commentaire,
      });
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
            await axiosInstance.delete(`/reviews/delete-review/${id_avis}`);
            fetchAvis();
            Alert.alert("Succès", "Avis supprimé !");
          } catch (error) {
            Alert.alert("Erreur", error.response?.data?.message || "Suppression échouée.");
          }
        },
      },
    ]);
  };

  const handleEditReview = async () => {
    if (!editCommentaire.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un commentaire.");
      return;
    }
    try {
      await axiosInstance.put(`/reviews/update-review/${editId}`, {
        note: editNote,
        commentaire: editCommentaire,
      });
      setEditId(null);
      fetchAvis();
      Alert.alert("Succès", "Avis modifié !");
    } catch (error) {
      Alert.alert("Erreur", error.response?.data?.message || "Modification échouée.");
    }
  };

  const canEditOrDelete = (avisItem) =>
    user && (user.id === avisItem.id_user || user.id_user === avisItem.id_user || user.role === "admin");

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">
            Chargement du produit...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!produit) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
          <Text className="text-lg text-gray-700 dark:text-gray-300">
            Produit non trouvé
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-5">
          {/* Titre du produit */}
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {produit.titre}
          </Text>
          
          {/* Image du produit */}
          {produit.imageObjectUrl && (
            <Image 
              source={{ uri: produit.imageObjectUrl }} 
              className="w-full h-52 mb-4 rounded-lg"
              resizeMode="cover"
            />
          )}
          
          {/* Description */}
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-6">
            {produit.description}
          </Text>
          
          {/* Prix */}
          <Text className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">
            {produit.prix} €
          </Text>

          {/* Boutons d'action */}
          <TouchableOpacity 
            onPress={handleAddToCart} 
            className="bg-blue-600 dark:bg-blue-500 py-3 px-4 mb-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold text-base">
              Ajouter au panier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleAddToWishlist} 
            className="bg-pink-600 dark:bg-pink-500 py-3 px-4 mb-6 rounded-lg"
          >
            <Text className="text-white text-center font-bold text-base">
              Ajouter à la wishlist
            </Text>
          </TouchableOpacity>

          {/* Section d'ajout d'avis */}
          {isAuthenticated ? (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-3">
                Laisser un avis
              </Text>
              
              {/* ✅ Picker corrigé avec styling amélioré */}
              <View className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mb-3">
                <Picker 
                  selectedValue={note} 
                  onValueChange={(value) => setNote(value)}
                  style={{
                    color: '#374151', // Couleur pour le mode clair
                    backgroundColor: 'transparent',
                  }}
                  dropdownIconColor="#6b7280"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Picker.Item 
                      key={n} 
                      label={`${n} étoile${n > 1 ? "s" : ""}`} 
                      value={n}
                      color="#374151"
                    />
                  ))}
                </Picker>
              </View>
              
              <TextInput
                placeholder="Votre commentaire"
                placeholderTextColor="#9ca3af"
                value={commentaire}
                onChangeText={setCommentaire}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 mb-3 rounded-lg min-h-20"
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity 
                onPress={handleSubmitReview} 
                className="bg-green-600 dark:bg-green-500 py-3 px-4 mb-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold text-base">
                  Envoyer l'avis
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="italic text-gray-600 dark:text-gray-400 mb-6 text-center">
              Connectez-vous pour laisser un avis.
            </Text>
          )}

          {/* Section des avis */}
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-4">
            Avis des clients ({avis.length})
          </Text>
          
          {avis.map((a) => (
            <View 
              key={a.id_avis} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm"
            >
              <Text className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {a.prenom || "Utilisateur"} - {a.note}/5 ⭐
              </Text>
              
              {editId === a.id_avis ? (
                <View>
                  {/* ✅ Picker d'édition corrigé */}
                  <View className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mb-3">
                    <Picker 
                      selectedValue={editNote} 
                      onValueChange={(value) => setEditNote(value)}
                      style={{
                        color: '#374151',
                        backgroundColor: 'transparent',
                      }}
                      dropdownIconColor="#6b7280"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Picker.Item 
                          key={n} 
                          label={`${n} étoile${n > 1 ? "s" : ""}`} 
                          value={n}
                          color="#374151"
                        />
                      ))}
                    </Picker>
                  </View>
                  
                  <TextInput
                    value={editCommentaire}
                    onChangeText={setEditCommentaire}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 mb-3 rounded-lg min-h-20"
                    multiline
                    textAlignVertical="top"
                  />
                  
                  <View className="flex-row space-x-3">
                    <TouchableOpacity 
                      onPress={handleEditReview} 
                      className="bg-green-600 dark:bg-green-500 py-2 px-4 rounded-lg flex-1"
                    >
                      <Text className="text-white text-center font-bold">
                        Modifier
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setEditId(null)} 
                      className="bg-gray-600 dark:bg-gray-500 py-2 px-4 rounded-lg flex-1"
                    >
                      <Text className="text-white text-center font-bold">
                        Annuler
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-gray-700 dark:text-gray-300 mb-3 leading-5">
                    {a.commentaire}
                  </Text>
                  
                  {canEditOrDelete(a) && (
                    <View className="flex-row space-x-5 mt-2">
                      <TouchableOpacity
                        onPress={() => {
                          setEditId(a.id_avis);
                          setEditNote(a.note);
                          setEditCommentaire(a.commentaire);
                        }}
                      >
                        <Text className="text-blue-600 dark:text-blue-400 font-medium">
                          Modifier
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity onPress={() => handleDeleteReview(a.id_avis)}>
                        <Text className="text-red-600 dark:text-red-400 font-medium">
                          Supprimer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
          
          {avis.length === 0 && (
            <Text className="text-center text-gray-500 dark:text-gray-400 italic py-8">
              Aucun avis pour ce produit
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ProductDetailScreen;







// import React, { useEffect, useState, useContext } from "react";
// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { Picker } from '@react-native-picker/picker';
// import { useLocalSearchParams, Link } from "expo-router";
// import { AuthContext } from "../contexts/AuthContext";
// import axiosInstance from "../services/axiosInstance";
// import Toast from "react-native-toast-message";

// const ProductDetailScreen = () => {
//   const { id } = useLocalSearchParams();
//   const [produit, setProduit] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [suggestions, setSuggestions] = useState([]);


//   const { user, isAuthenticated } = useContext(AuthContext);

//   useEffect(() => {
//     fetchProduit();
//     fetchAvis();
//     fetchSuggestions();
//   }, [id]);

//   // Suggestions
//   const fetchSuggestions = async () => {
//     try {
//       const res = await axiosInstance.get(`/products/${id}/suggestions`);
//       const data = res.data;

//       const suggestionsWithImages = data.map((prod) => ({
//         ...prod,
//         imageUri: prod.image
//           ? `${axiosInstance.defaults.baseURL}/products/${prod.id_produit}/image`
//           : null,
//       }));

//       setSuggestions(suggestionsWithImages);
//     } catch (error) {
//       console.error("Erreur récupération suggestions :", error);
//     }
//   };

//         {/* Produits similaires */}
//         {suggestions.length > 0 && (
//           <View className="mb-12">
//             <Text className="text-2xl font-bold mb-4 text-black dark:text-white">Produits similaires</Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               {suggestions.map((prod) => (
//                 <View
//                   key={prod.id_produit}
//                   className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mr-4"
//                   style={{ width: 250 }}
//                 >
//                   {prod.imageUri && (
//                     <Image
//                       source={{ uri: prod.imageUri }}
//                       className="w-full h-40 rounded mb-3"
//                       resizeMode="cover"
//                     />
//                   )}
//                   <Text className="text-lg font-semibold text-black dark:text-white mb-1" numberOfLines={2}>
//                     {prod.titre}
//                   </Text>
//                   <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1" numberOfLines={2}>
//                     {prod.description}
//                   </Text>
//                   <Text className="font-bold text-green-600 dark:text-green-400 mb-2">
//                     {prod.prix} €
//                   </Text>
//                   <Link href={`/produit/${prod.id_produit}`} asChild>
//                     <TouchableOpacity className="bg-blue-600 px-3 py-2 rounded">
//                       <Text className="text-white text-center text-sm">Voir le produit</Text>
//                     </TouchableOpacity>
//                   </Link>
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default ProductDetailScreen;