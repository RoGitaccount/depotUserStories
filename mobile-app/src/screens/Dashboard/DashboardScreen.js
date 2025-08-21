import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axiosInstance from "../../services/axiosInstance";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/PageComponent/screenWrapper";

const STATIC_FILTERS = [
  { label: "Toutes", value: "all" },
  { label: "7 derniers jours", value: "7days" },
  { label: "1 mois", value: "1month" },
  { label: "6 mois", value: "6months" },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [years, setYears] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");

  // Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => binary += String.fromCharCode(byte));
    return btoa(binary);
  };

  // Récupération des années
  useEffect(() => {
    axiosInstance.get("/userdashboard/orders-years")
      .then((res) => setYears(res.data.years || []))
      .catch(() => console.warn("Erreur lors du chargement des années"));
  }, []);

  // Infos personnelles
  useEffect(() => {
    axiosInstance.get("/userdashboard/info")
      .then((res) => {
        setUserInfo(res.data[0] || res.data);
        setLoadingInfo(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des infos utilisateur.");
        setLoadingInfo(false);
      });
  }, []);

  // Historique des commandes
  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoadingOrders(true);
      try {
        let endpoint = `/userdashboard/orders-history?filter_date=${filter}`;
        if (filter === "year" && selectedYear) {
          endpoint += `&annee_val=${selectedYear}`;
        }
        const res = await axiosInstance.get(endpoint);

        const commandesMap = {};
        res.data.forEach((order) => {
          const { id_commande, titre, description, id_produit } = order;
          if (!commandesMap[id_commande]) {
            commandesMap[id_commande] = { ...order, produits: [] };
          }
          commandesMap[id_commande].produits.push({ titre, description, id_produit });
        });

        const commandesTriees = Object.values(commandesMap).sort(
          (a, b) => new Date(b.date_commande) - new Date(a.date_commande)
        );

        setOrders(commandesTriees);
      } catch {
        setError("Erreur lors du chargement de l'historique des commandes.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrderHistory();
  }, [filter, selectedYear]);

  // Changement de filtre
  const handleFilterChange = (val) => {
    if (STATIC_FILTERS.map((f) => f.value).includes(val)) {
      setFilter(val);
      setSelectedYear("");
    } else {
      setFilter("year");
      setSelectedYear(val);
    }
  };

  // Téléchargement facture PDF - VERSION OPTIMISÉE
  const handleDownloadFacture = async (facture_token, id_commande) => {
    try {
      console.log("Téléchargement facture avec axiosInstance...");
      
      // Utiliser directement axiosInstance (qui gère l'auth automatiquement)
      const res = await axiosInstance.get(`/user/facture/${facture_token}`, { 
        responseType: "arraybuffer" 
      });

      const base64Data = arrayBufferToBase64(res.data);
      const fileUri = FileSystem.documentDirectory + `facture_${id_commande}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Facture sauvegardée:", fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Facture ${id_commande}`,
        });
      } else {
        Alert.alert("Téléchargement réussi", `Facture enregistrée dans ${fileUri}`);
      }

    } catch (error) {
      console.error("Erreur téléchargement facture:", error);
      Alert.alert(
        "Erreur", 
        `Impossible de télécharger la facture: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <ScreenWrapper>
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
      {/* Infos personnelles - Maintenant en premier */}
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Mes informations
        </Text>
        {loadingInfo ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="ml-2 text-gray-500 dark:text-gray-400">Chargement...</Text>
          </View>
        ) : userInfo ? (
          <View className="space-y-4">
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Text className="text-gray-800 dark:text-gray-200 text-base">
                <Text className="font-semibold text-gray-900 dark:text-white">Nom : </Text>
                {userInfo.nom}
              </Text>
            </View>
            
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Text className="text-gray-800 dark:text-gray-200 text-base">
                <Text className="font-semibold text-gray-900 dark:text-white">Prénom : </Text>
                {userInfo.prenom}
              </Text>
            </View>
            
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Text className="text-gray-800 dark:text-gray-200 text-base">
                <Text className="font-semibold text-gray-900 dark:text-white">Email : </Text>
                {userInfo.email}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg mt-6 shadow-sm active:opacity-80"
              onPress={() => navigation.navigate("MyData")}
            >
              <Text className="text-white font-semibold text-center text-base">
                Accéder à mes données
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-400 font-medium">
              Impossible de charger les informations.
            </Text>
          </View>
        )}

        {error ? (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-4 border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-400 font-medium">{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Historique commandes - Maintenant en second */}
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Historique de mes commandes
        </Text>
        
        {/* Picker maintenant en dessous du titre */}
        <View className="bg-gray-100 dark:bg-gray-700 rounded-lg mb-6 ">
          <Picker
            selectedValue={filter === "year" ? selectedYear || "year" : filter}
            style={{ 
              height: 50, 
              width: "100%", 
              color: "#374151",
              backgroundColor: 'transparent'
            }}
            dropdownIconColor="#6b7280"
            onValueChange={handleFilterChange}
          >
            {STATIC_FILTERS.map((f) => (
              <Picker.Item key={f.value} label={f.label} value={f.value} />
            ))}
            {years.length > 0 &&
              years.map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year.toString()} />
              ))}
          </Picker>
        </View>
        {loadingOrders ? (
          <View className="flex-row items-center justify-center py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="ml-3 text-gray-500 dark:text-gray-400 text-base">
              Chargement des commandes...
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-8 text-center">
            <Text className="italic text-gray-600 dark:text-gray-400 text-base text-center">
              Aucune commande trouvée.
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <View 
              key={order.id_commande} 
              className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl p-5 mb-4 shadow-sm"
            >
              <View className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Commande n° {order.id_commande}
                </Text>
                
                <View className="space-y-2">
                  <Text className="text-gray-700 dark:text-gray-300 text-base">
                    <Text className="font-medium text-gray-900 dark:text-white">Date : </Text>
                    {order.date_commande ? new Date(order.date_commande).toLocaleString() : "N/A"}
                  </Text>
                  
                  <Text className="text-gray-700 dark:text-gray-300 text-base">
                    <Text className="font-medium text-gray-900 dark:text-white">Statut : </Text>
                    <Text className={`font-medium px-2 py-1 rounded ${
                      order.statut === 'livré' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      order.statut === 'en cours' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {order.statut}
                    </Text>
                  </Text>
                  
                  <Text className="text-gray-700 dark:text-gray-300 text-base">
                    <Text className="font-medium text-gray-900 dark:text-white">Total : </Text>
                    <Text className="font-bold text-green-600 dark:text-green-400">
                      {order.montant_total} €
                    </Text>
                  </Text>
                </View>
              </View>

              {order.facture_token && (
                <TouchableOpacity 
                  className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4 active:opacity-70"
                  onPress={() => handleDownloadFacture(order.facture_token, order.id_commande)}
                >
                  <Text className="text-blue-600 dark:text-blue-400 font-medium text-center text-base">
                    📄 Télécharger la facture
                  </Text>
                </TouchableOpacity>
              )}

              <View className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <Text className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  Produits commandés :
                </Text>
                <View className="bg-white dark:bg-gray-800/50 rounded-lg p-3 space-y-1">
                  {order.produits.map((prod, idx) => (
                    <Text 
                      key={idx} 
                      className="text-gray-700 dark:text-gray-300 text-sm leading-5"
                    >
                      • {prod.titre} {prod.description && `— ${prod.description}`}
                    </Text>
                  ))}
                </View>
              </View>
              
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-3">
                <Text className="font-medium text-gray-800 dark:text-gray-200">Paiement : </Text>
                {order.date_transaction ? new Date(order.date_transaction).toLocaleString() : "N/A"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}