import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BillingForm from '../../components/Checkout/BillingForm';
import PromoCodeForm from '../../components/Checkout/PromoCodeForm';
import CartSummary from "../../components/Cart/CartSummary";
import { cartService } from '../../services/api';
import axios from 'axios';
import { getUserIdFromToken, isTokenValid } from '../../services/auth';
import RedirectButton from '../../components/PageComponents/RedirectButton';

const CheckoutPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
 
  const [cartError, setCartError] = useState(null);
  const [userError, setUserError] = useState(null);


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

  // // Chargement du panier
  // const loadCart = async () => {
  //   try {
  //     const data = await cartService.getCart();
  //     setCartItems(data);
  //     const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
  //     setTotal(cartTotal);
  //   } catch (error) {
  //     console.error('Erreur chargement panier:', error);
  //     setError('Impossible de charger le panier');
  //   }
  // };

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
    console.error('Erreur chargement panier:', error);
    setError("Impossible de charger le panier.");
  }
};



  // Effet pour charger les informations utilisateur et facturation
  useEffect(() => {
    const fetchUserAndBillingInfo = async () => {
      try {
        setLoading(true);

        const id_user = getUserIdFromToken();
        if (!id_user) throw new Error("Utilisateur non authentifié");

        const [userResponse, billingResponse] = await Promise.all([
          axios.get(`http://localhost:8001/api/rgpd/get/${id_user}`),
          axios.get(`http://localhost:8001/api/rgpd/get_billing_info/${id_user}`)
        ]);

        setUserInfo(userResponse.data);
        setBillingDetails(billingResponse.data);
      } catch (error) {
        console.error('Erreur:', error);
        setUserError("Erreur lors du chargement des informations utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBillingInfo();
  }, []);

  // Effet pour combiner les informations utilisateur et facturation
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

  // Gestionnaire de soumission des informations de facturation
  const handleBillingSubmit = async (billingData) => {
    
      // Vérifie la validité du token AVANT de lancer le paiement
    if (!isTokenValid()) {
      alert("Votre session a expiré, veuillez vous reconnecter.");
      window.location.href = "/login";
      return;
    }

      // Vérification panier vide ou total à 0
    if (!cartItems || cartItems.length === 0 || (total - reduction) <= 0) {
      alert("Votre panier est vide ou le montant total est nul. Paiement impossible.");
      window.location.href = "/checkout";
      return;
    }

    try {
      const id_user = getUserIdFromToken();
      if (!id_user) throw new Error("Utilisateur non authentifié");

      // 1. Sauvegarder les informations de facturation
      await axios.post(`http://localhost:8001/api/rgpd/update_billing_data/${id_user}`, {
        id_user,
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
    return <div className="loading text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">Chargement...</div>;
  }


if (cartError || userError) {
  return (
    <div className="text-center text-black dark:text-white min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <p className="mb-4 text-lg font-semibold text-red-400">
        {cartError || userError}
      </p>
      {!getUserIdFromToken() && (
        <RedirectButton
          to="/login"
          failureMessage={null}
          className="w-fit px-6 py-2"
        >
          Se connecter
        </RedirectButton>
      )}
    </div>
  );
}

  return (
    <div className=" min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto p-6">

    

        <div className="mb-6">
          <CartSummary
            items={cartItems}
            total={total}
            reduction={reduction}
            reductionPercent={reductionPercent}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Code Promotionnel :</h2>
          <div className="max-w-md">
            <PromoCodeForm onSubmit={handlePromoSubmit} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Informations de facturation</h2>
          <BillingForm
            initialValues={billingInfo}
            onSubmit={handleBillingSubmit}
            disabled={!cartItems || cartItems.length === 0 || (total - reduction) <= 0}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;