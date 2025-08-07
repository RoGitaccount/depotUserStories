//-----------------------------------------
//TODO assurer la validité des informations (exemple: pays, eviter que l'utilisateurs mettent "frances", ...)
//-----------------------------------------

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BillingForm from '../../components/Checkout/BillingForm';
import PromoCodeForm from '../../components/Checkout/PromoCodeForm';
import CartSummary from "../../components/Cart/CartSummary";
import RedirectButton from '../../components/PageComponents/RedirectButton';
import { cartService } from '../../services/api';
import { isAuthenticated, fetchUserFromCookie } from '../../services/auth';
import axios from 'axios';
import axiosInstance from '../../services/axiosInstance';
import { toast, Bounce } from "react-toastify";

export const isValidTvaFormat = (numeroTva) => {
  if (!numeroTva) return false;
  const tva = numeroTva.trim().toUpperCase();
  const regex = /^[A-Z]{2}[A-Z0-9]{8,12}$/;
  return regex.test(tva);
};

const CheckoutPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [userError, setUserError] = useState(null);

  const [billingInfo, setBillingInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null);
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [total, setTotal] = useState(location.state?.cartTotal || 0);
  const [promoCode, setPromoCode] = useState('');
  const [promoId, setPromoId] = useState(null);
  const [reduction, setReduction] = useState(0);
  const [reductionPercent, setReductionPercent] = useState(0);

  // Chargement du panier
  useEffect(() => {
    if (!location.state?.cartTotal) {
      loadCart();
    }
  }, [location.state]);

  const loadCart = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        setCartError("Vous devez être connecté pour accéder au panier.");
        return;
      }
      const data = await cartService.getCart();
      setCartItems(data);
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      setCartError("Impossible de charger le panier.");
    }
  };

  // Chargement infos utilisateur et facturation
  useEffect(() => {
    const fetchUserAndBillingInfo = async () => {
      try {
        setLoading(true);
        const user = await fetchUserFromCookie();
        if (!user) throw new Error("Utilisateur non connecté");

        const billingRes = await axiosInstance.get("/rgpd/get_billing_info/me");

        setUserInfo(user);
        setBillingDetails(billingRes.data);
      } catch (error) {
        console.error('Erreur:', error);
        setUserError("Erreur lors du chargement des informations utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBillingInfo();
  }, []);

  // Fusion des infos utilisateur + facturation
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

  // Soumission formulaire facturation
  const handleBillingSubmit = async (billingData) => {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      // alert("Votre session a expiré, veuillez vous reconnecter.");
      toast.warning('Votre session a expiré, veuillez vous reconnecter.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
      window.location.href = "/login";
      return;
    }

    if (!isValidTvaFormat(billingData.numeroTva)) {
      // alert("Numéro de TVA invalide");
      toast.error('Numéro de TVA invalide',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
      return;
    }

    if (!cartItems || cartItems.length === 0 || (total - reduction) <= 0) {
      // alert("Votre panier est vide ou le montant total est nul.");
      toast.error('Votre panier est vide ou le montant total est nul.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
      return;
    }

    try {
      await axiosInstance.post("/rgpd/update_billing_data/me", billingData);

      const PaysNumeroTva = (billingData.numeroTva || '').trim().toUpperCase();
      const codePaysTVA = PaysNumeroTva.slice(0, 2);
      const pays = billingData.pays || '';

      let tauxTVA = 0;
      if (pays.toLowerCase() === "france" || codePaysTVA === "FR") {
        tauxTVA = 0.2;
      }

      const prixTTC = total * (1 + tauxTVA);

      const montantReduction = (prixTTC * reductionPercent) / 100;
      const prixTTCAvecPromo = prixTTC - montantReduction;

      const response = await axiosInstance.post('/stripe/create-checkout-session', {
        cartItems,
        totalAmount: prixTTCAvecPromo,
        initialAmount: prixTTC,
        promoCode: promoCode ? `${reductionPercent}% (${montantReduction.toFixed(2)}€)` : '',
        id_promotion: promoId,
        billingInfo: billingData
      },);

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erreur:', error);
      // alert('Une erreur est survenue lors du paiement.');
      toast.error('Une erreur est survenue lors du paiement.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
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
      // alert(result.message);
      toast.success(result.message,
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
    } catch (error) {
      console.error('Erreur code promo:', error);
      setReductionPercent(0);
      setReduction(0);
      setPromoCode('');
      setPromoId(null);
      // alert(error.message || "Code promo invalide.");
      toast.error(error.message || 'Code promo invalide.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
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
            pays={billingInfo?.pays || 'France'}
            numeroTva={billingInfo?.numeroTva || ''}
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