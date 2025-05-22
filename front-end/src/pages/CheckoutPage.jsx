import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BillingForm from '../components/Checkout/BillingForm';
import PromoCodeForm from '../components/Checkout/PromoCodeForm';
import CartSummary from '../components/Cart/CartSummary';
import { cartService } from '../services/api';
import axios from 'axios';

const CheckoutPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les données
  const [billingInfo, setBillingInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null);
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [total, setTotal] = useState(location.state?.cartTotal || 0);
  const [promoCode, setPromoCode] = useState('');
  const [promoId, setPromoId] = useState(null);
  const [reduction, setReduction] = useState(0);
  const [reductionPercent, setReductionPercent] = useState(0);

  // Effet pour charger les données du panier si non présentes
  useEffect(() => {
    if (!location.state?.cartTotal) {
      loadCart();
    }
  }, [location.state]);

  // Chargement du panier
  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCartItems(data);
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      setError('Impossible de charger le panier');
    }
  };

  // Effet pour charger les informations utilisateur et facturation
  useEffect(() => {
    const fetchUserAndBillingInfo = async () => {
      try {
        setLoading(true);
        const [userResponse, billingResponse] = await Promise.all([
          axios.get('http://localhost:8001/api/rgpd/get/1'),
          axios.get('http://localhost:8001/api/rgpd/get_billing_info/1')
        ]);

        setUserInfo(userResponse.data);
        setBillingDetails(billingResponse.data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des informations');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBillingInfo();
  }, []);

  // Effet pour combiner les informations utilisateur et facturation
  useEffect(() => {
    if (userInfo && billingDetails && billingDetails[0]) {
      const combinedInfo = {
        nom: userInfo.nom || '',
        prenom: userInfo.prenom || '',
        email: userInfo.email || '',
        telephone: userInfo.telephone || '',
        adresse: billingDetails[0].adresse_ligne1 || '',
        complementAdresse: billingDetails[0].adresse_ligne2 || '',
        ville: billingDetails[0].ville || '',
        region: billingDetails[0].region || '',
        codePostal: billingDetails[0].code_postal || '',
        pays: billingDetails[0].pays || '',
        nomEntreprise: billingDetails[0].nom_entreprise || '',
        numeroTva: billingDetails[0].numero_tva || ''
      };
      
      setBillingInfo(combinedInfo);
    }
  }, [userInfo, billingDetails]);

  // Gestionnaire de soumission des informations de facturation
  const handleBillingSubmit = async (billingData) => {
    
      // Vérification panier vide ou total à 0
    if (!cartItems || cartItems.length === 0 || (total - reduction) <= 0) {
      alert("Votre panier est vide ou le montant total est nul. Paiement impossible.");
      window.location.href = "/checkout";
      return;
    }

    try {
      // 1. Sauvegarder les informations de facturation
      await axios.post('http://localhost:8001/api/rgpd/update_billing_data/1', {
        id_user: 1,
        ...billingData
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
      });


      // 3. Rediriger vers Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement.');
    }
  };

  // Gestionnaire de code promo
  const handlePromoSubmit = async (code) => {
    try {
      const result = await cartService.applyPromo(code);
      
      const reductionPercentage = parseFloat(result.montant_reduction);
      const reductionAmount = (total * reductionPercentage) / 100;
      
      setReductionPercent(reductionPercentage);
      setReduction(reductionAmount);
      setPromoCode(code);
      setPromoId(result.id_promotion);
      
      alert(result.message);
    } catch (error) {
      console.error('Erreur code promo:', error);
      // Réinitialiser les états
      setReductionPercent(0);
      setReduction(0);
      setPromoCode('');
      setPromoId(null);
      
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (  
    <div className="checkout-page">
      <h1>Finalisation de la commande</h1>

      <div className="cart-summary-section">
        <CartSummary 
          items={cartItems}
          total={total}
          reduction={reduction}
          reductionPercent={reductionPercent}
        />
      </div>

      <div className="promo-section">
        <h2>Code Promo</h2>
        <PromoCodeForm onSubmit={handlePromoSubmit} />
      </div>

      <div className="billing-section">
        <h2>Informations de facturation</h2>
        <BillingForm 
          initialValues={billingInfo}
          onSubmit={handleBillingSubmit}
          disabled ={!cartItems || cartItems.length === 0 || (total - reduction) <= 0}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;