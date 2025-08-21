// CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import BillingForm from '../../components/Checkout/BillingForm';
import PromoCodeForm from '../../components/Checkout/PromoCodeForm';
import CartSummary from "../../components/Cart/CartSummary";
import RedirectButton from '../../components/PageComponent/RedirectButton';
import { cartService } from '../../services/api';
import { getUserIdFromToken, isTokenValid } from '../../services/auth';
import axiosInstance from '../../services/axiosInstance';
import { getToken } from '../../services/authStorage';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';

const CheckoutScreen = () => {
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

  // ⭐ États pour WebView
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

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
          axiosInstance.get("/rgpd/me"),
          axiosInstance.get("/rgpd/get_billing_info/me")
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
      await axiosInstance.post("/rgpd/update_billing_data/me", billingData);

      const TVA = 0.2;
      const prixTTC = total * (1 + TVA);
      const montantReduction = (prixTTC * reductionPercent) / 100;
      const prixTTCAvecPromo = prixTTC - montantReduction;

      const response = await axiosInstance.post('/stripe/create-checkout-session', {
        cartItems,
        totalAmount: prixTTCAvecPromo,
        initialAmount: prixTTC,
        promoCode: promoCode ? `${reductionPercent}% (${montantReduction.toFixed(2)}€)` : '',
        id_promotion: promoId,
        billingInfo: billingData
      });

      if (response.data.url) {
        // ⭐ Ouvrir dans WebView au lieu du navigateur
        setCheckoutUrl(response.data.url);
        setShowWebView(true);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la session de paiement.');
    }
  };

  // ⭐ Gestion de la navigation WebView
  const handleWebViewNavigation = (navState) => {
    console.log('Navigation WebView:', navState.url);
    
    // Détecter les URLs de succès
    if (navState.url.includes('/success')) {
      setShowWebView(false);
      const sessionId = navState.url.match(/session_id=([^&]+)/)?.[1];
      navigation.navigate('SuccessScreen', { 
        session_id: sessionId 
      });
    } 
    // Détecter les URLs d'annulation
    else if (navState.url.includes('/cancel')) {
      setShowWebView(false);
      Alert.alert('Paiement annulé', 'Vous avez annulé le paiement.');
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
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center p-8 bg-white dark:bg-gray-900">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-base text-blue-600 dark:text-blue-400">Chargement...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (cartError || userError) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-gray-900">
          <Text className="text-red-500 text-base mb-4 text-center">
            {cartError || userError}
          </Text>
          {!getUserIdFromToken() && (
            <RedirectButton
              to="Login"
              failureMessage={null}
              className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
              navigation={navigation}
            >
              Se connecter
            </RedirectButton>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-950 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6">
          <CartSummary
            items={cartItems}
            total={total}
            reduction={reduction}
            reductionPercent={reductionPercent}
          />
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Code Promotionnel :</Text>
          <PromoCodeForm onSubmit={handlePromoSubmit} />
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Informations de facturation</Text>
          <BillingForm
            initialValues={billingInfo}
            onSubmit={handleBillingSubmit}
            disabled={!cartItems || cartItems.length === 0 || (total - reduction) <= 0}
          />
        </View>
      </ScrollView>

      {/* ⭐ Modal WebView pour Stripe Checkout */}
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowWebView(false);
          Alert.alert('Paiement annulé', 'Vous avez fermé la page de paiement.');
        }}
      >
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavigation}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 text-base text-blue-600">
                  Chargement du paiement sécurisé...
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default CheckoutScreen;