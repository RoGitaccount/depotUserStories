// import React, { useState, useEffect } from 'react';
// import { ScrollView, View, Text, Alert, ActivityIndicator } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import BillingForm from '../../components/Checkout/BillingForm';
// import PromoCodeForm from '../../components/Checkout/PromoCodeForm';
// import CartSummary from "../../components/Cart/CartSummary";
// import RedirectButton from '../../components/PageComponent/RedirectButton';
// import { cartService } from '../../services/api';
// import { getUserIdFromToken, isTokenValid } from '../../services/auth';
// import axios from 'axios';

// const CheckoutPage = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const [loading, setLoading] = useState(true);

//   const [cartError, setCartError] = useState(null);
//   const [userError, setUserError] = useState(null);

//   const [billingInfo, setBillingInfo] = useState(null);
//   const [userInfo, setUserInfo] = useState(null);
//   const [billingDetails, setBillingDetails] = useState(null);
//   const [cartItems, setCartItems] = useState(route.params?.cartItems || []);
//   const [total, setTotal] = useState(route.params?.cartTotal || 0);
//   const [promoCode, setPromoCode] = useState('');
//   const [promoId, setPromoId] = useState(null);
//   const [reduction, setReduction] = useState(0);
//   const [reductionPercent, setReductionPercent] = useState(0);

//   useEffect(() => {
//     if (!route.params?.cartTotal) {
//       loadCart();
//     }
//   }, [route.params]);

//   const loadCart = async () => {
//     try {
//       const id_user = getUserIdFromToken();
//       if (!id_user) {
//         setCartError("Vous devez être connecté pour voir votre panier.");
//         return;
//       }

//       const data = await cartService.getCart();
//       setCartItems(data);
//       const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
//       setTotal(cartTotal);
//     } catch (error) {
//       console.error('Erreur chargement panier:', error);
//       setCartError("Impossible de charger le panier.");
//     }
//   };

//   useEffect(() => {
//     const fetchUserAndBillingInfo = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");

//         const [userResponse, billingResponse] = await Promise.all([
//           axios.get("http://localhost:8001/api/rgpd/me", {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           axios.get("http://localhost:8001/api/rgpd/get_billing_info/me", {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         setUserInfo(userResponse.data);
//         setBillingDetails(billingResponse.data);
//       } catch (error) {
//         console.error('Erreur chargement utilisateur:', error);
//         setUserError("Erreur lors du chargement des informations utilisateur.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserAndBillingInfo();
//   }, []);

//   useEffect(() => {
//     if (userInfo) {
//       const billing = billingDetails && billingDetails[0] ? billingDetails[0] : {};
//       const combinedInfo = {
//         nom: userInfo.nom || '',
//         prenom: userInfo.prenom || '',
//         email: userInfo.email || '',
//         telephone: billing.telephone || '',
//         adresse: billing.adresse_ligne1 || '',
//         complementAdresse: billing.adresse_ligne2 || '',
//         ville: billing.ville || '',
//         region: billing.region || '',
//         codePostal: billing.code_postal || '',
//         pays: billing.pays || '',
//         nomEntreprise: billing.nom_entreprise || '',
//         numeroTva: billing.numero_tva || ''
//       };
//       setBillingInfo(combinedInfo);
//     }
//   }, [userInfo, billingDetails]);

//   const handleBillingSubmit = async (billingData) => {
//     if (!isTokenValid()) {
//       Alert.alert("Session expirée", "Veuillez vous reconnecter.");
//       navigation.navigate("Login");
//       return;
//     }

//     if (!cartItems || cartItems.length === 0 || (total - reduction) <= 0) {
//       Alert.alert("Erreur", "Panier vide ou montant nul.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       await axios.post("http://localhost:8001/api/rgpd/update_billing_data/me", billingData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const TVA = 0.2;
//       const prixTTC = total * (1 + TVA);
//       const montantReduction = (prixTTC * reductionPercent) / 100;
//       const prixTTCAvecPromo = prixTTC - montantReduction;

//       const response = await axios.post('http://localhost:8001/api/stripe/create-checkout-session', {
//         cartItems,
//         totalAmount: prixTTCAvecPromo,
//         initialAmount: prixTTC,
//         promoCode: promoCode ? `${reductionPercent}% (${montantReduction.toFixed(2)}€)` : '',
//         id_promotion: promoId,
//         billingInfo: billingData
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Redirection web Stripe
//       window.location.href = response.data.url;

//     } catch (error) {
//       console.error("Erreur paiement:", error);
//       Alert.alert("Erreur", "Échec de la création de la session de paiement.");
//     }
//   };

//   const handlePromoSubmit = async (code) => {
//     try {
//       const result = await cartService.applyPromo(code);

//       const reductionPercentage = parseFloat(result.montant_reduction);
//       const reductionAmount = (total * reductionPercentage) / 100;

//       setReductionPercent(reductionPercentage);
//       setReduction(reductionAmount);
//       setPromoCode(code);
//       setPromoId(result.id_promotion);

//       Alert.alert("Code promo appliqué", result.message);
//     } catch (error) {
//       console.error('Erreur promo:', error);
//       setReductionPercent(0);
//       setReduction(0);
//       setPromoCode('');
//       setPromoId(null);
//       Alert.alert("Erreur", error.message || "Code promo invalide");
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
//         <ActivityIndicator size="large" color="#3B82F6" />
//         <Text className="text-black dark:text-white mt-4">Chargement...</Text>
//       </View>
//     );
//   }

//   if (cartError || userError) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-6">
//         <Text className="text-red-400 text-lg font-semibold mb-4">
//           {cartError || userError}
//         </Text>
//         {!getUserIdFromToken() && (
//           <RedirectButton
//             to="Login"
//             failureMessage={null}
//             className="px-4 py-2"
//           >
//             Se connecter
//           </RedirectButton>
//         )}
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-4 py-6">
//       <View className="mb-6">
//         <CartSummary
//           items={cartItems}
//           total={total}
//           reduction={reduction}
//           reductionPercent={reductionPercent}
//         />
//       </View>

//       <View className="mb-6">
//         <Text className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
//           Code Promotionnel :
//         </Text>
//         <PromoCodeForm onSubmit={handlePromoSubmit} />
//       </View>

//       <View className="mb-6">
//         <BillingForm
//           initialValues={billingInfo}
//           onSubmit={handleBillingSubmit}
//           disabled={!cartItems || cartItems.length === 0 || (total - reduction) <= 0}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// export default CheckoutPage;



import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BillingForm from '../../components/Checkout/BillingForm';
import PromoCodeForm from '../../components/Checkout/PromoCodeForm';
import CartSummary from "../../components/Cart/CartSummary";
import RedirectButton from '../../components/PageComponent/RedirectButton';
import { cartService } from '../../services/api';
import { getUserIdFromToken, isTokenValid } from '../../services/auth';
import axios from 'axios';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

const CheckoutPage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [userError, setUserError] = useState(null);

  const [billingInfo, setBillingInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null);
  const [cartItems, setCartItems] = useState(route.params?.cartItems || []);
  const [total, setTotal] = useState(route.params?.cartTotal || 0);
  const [promoCode, setPromoCode] = useState('');
  const [promoId, setPromoId] = useState(null);
  const [reduction, setReduction] = useState(0);
  const [reductionPercent, setReductionPercent] = useState(0);

  useEffect(() => {
    if (!route.params?.cartTotal) {
      loadCart();
    }
  }, [route.params]);

  const loadCart = async () => {
    try {
      const id_user = getUserIdFromToken();
      if (!id_user) {
        setCartError("Vous devez être connecté pour pouvoir renseigner vos informations de paiements.");
        return;
      }
      const data = await cartService.getCart();
      setCartItems(data);
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
    } catch (error) {
      setCartError("Impossible de charger le panier.");
    }
  };

  useEffect(() => {
    const fetchUserAndBillingInfo = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const [userResponse, billingResponse] = await Promise.all([
          axios.get("http://localhost:8001/api/rgpd/me", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:8001/api/rgpd/get_billing_info/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUserInfo(userResponse.data);
        setBillingDetails(billingResponse.data);
      } catch (error) {
        setUserError("Erreur lors du chargement des informations utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndBillingInfo();
  }, []);

  useEffect(() => {
    if (userInfo) {
      const billing = billingDetails && billingDetails[0] ? billingDetails[0] : {};
      const combinedInfo = {
        nom: userInfo.nom || '',
        prenom: userInfo.prenom || '',
        email: userInfo.email || '',
        telephone: billing.telephone || '',
        adresse: billing.adresse_ligne1 || '',
        complementAdresse: billing.adresse_ligne2 || '',
        ville: billing.ville || '',
        region: billing.region || '',
        codePostal: billing.code_postal || '',
        pays: billing.pays || '',
        nomEntreprise: billing.nom_entreprise || '',
        numeroTva: billing.numero_tva || ''
      };
      setBillingInfo(combinedInfo);
    }
  }, [userInfo, billingDetails]);

  const handleBillingSubmit = async (billingData) => {
    if (!isTokenValid()) {
      Alert.alert("Session expirée", "Veuillez vous reconnecter.", [
        { text: "OK", onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    if (!cartItems || cartItems.length === 0 || (total - reduction) <= 0) {
      Alert.alert("Panier vide", "Votre panier est vide ou le montant total est nul. Paiement impossible.", [
        { text: "OK", onPress: () => navigation.navigate('Checkout') }
      ]);
      return;
    }
    try {
      const token = await getToken();
      await axios.post("http://localhost:8001/api/rgpd/update_billing_data/me", {
        ...billingData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const TVA = 0.2;
      const prixTTC = total * (1 + TVA);
      const montantReduction = (prixTTC * reductionPercent) / 100;
      const prixTTCAvecPromo = prixTTC - montantReduction;

      const response = await axios.post('http://localhost:8001/api/stripe/create-checkout-session', {
        cartItems,
        totalAmount: prixTTCAvecPromo,
        initialAmount: prixTTC,
        promoCode: promoCode ? `${reductionPercent}% (${montantReduction.toFixed(2)}€)` : '',
        id_promotion: promoId,
        billingInfo: billingData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirection Stripe : sur mobile, ouvrir dans un navigateur externe
      if (response.data.url) {
        // Utilise Linking d'Expo pour ouvrir l'URL
        import('expo-linking').then(Linking => {
          Linking.openURL(response.data.url);
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la session de paiement.');
    }
  };

  const handlePromoSubmit = async (code) => {
    try {
      const result = await cartService.applyPromo(code);
      const reductionPercentage = parseFloat(result.montant_reduction);
      const reductionAmount = (total * reductionPercentage) / 100;
      setReductionPercent(reductionPercentage);
      setReduction(reductionAmount);
      setPromoCode(code);
      setPromoId(result.id_promotion);
      Alert.alert("Code promo", result.message);
    } catch (error) {
      setReductionPercent(0);
      setReduction(0);
      setPromoCode('');
      setPromoId(null);
      Alert.alert("Erreur", error.message || "Code promo invalide.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (cartError || userError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{cartError || userError}</Text>
        {!getUserIdFromToken() && (
          <RedirectButton
            to="Login"
            failureMessage={null}
            style={styles.button}
            navigation={navigation}
          >
            Se connecter
          </RedirectButton>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.section}>
        <CartSummary
          items={cartItems}
          total={total}
          reduction={reduction}
          reductionPercent={reductionPercent}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Code Promotionnel :</Text>
        <PromoCodeForm onSubmit={handlePromoSubmit} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de facturation</Text>
        <BillingForm
          initialValues={billingInfo}
          onSubmit={handleBillingSubmit}
          disabled={!cartItems || cartItems.length === 0 || (total - reduction) <= 0}
        />
      </View>
    </ScrollView>
  );
};

const getToken = async () => {
  // Expo SecureStore recommandé pour la prod
  return await Promise.resolve(localStorage.getItem("token"));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2563eb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2563eb',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default CheckoutPage;