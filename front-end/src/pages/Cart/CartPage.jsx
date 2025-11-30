import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartList from '../../components/Cart/CartList';
import CartSummary from '../../components/Cart/CartSummary';
import axios from 'axios';
import RedirectButton from '../../components/PageComponents/RedirectButton';
import axiosInstance from "../../services/axiosInstance";
import { toast, Bounce } from "react-toastify";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    let objectUrls = [];

    try {
      // 1. Récupérer la liste des produits du panier (sans images blob)
      const res = await axiosInstance.get('/cart');
      const data = res.data;

      // 2. Pour chaque produit, récupérer l'image en blob et créer URL
      const itemsWithImages = await Promise.all(
        data.map(async (item) => {
          try {
            const imageRes = await axiosInstance(`/products/${item.id_produit}/image`, {
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(imageRes.data);
            objectUrls.push(imageUrl);
            return { ...item, image: imageUrl };
          } catch {
            // Si erreur image, on retourne item sans image ou avec une image par défaut
            return { ...item, image: null };
          }
        })
      );

      setCartItems(itemsWithImages);

      // Calculer le total
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
      setError(null);

    } catch (err) {
      console.error('Erreur chargement panier:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Vous devez être connecté pour accéder à votre panier.");
        } else {
          setError("Erreur lors du chargement du panier. Veuillez réessayer.");
        }
      } else {
        setError("Une erreur réseau s'est produite. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }

    // Nettoyer les URLs blob quand le composant se démonte
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  };

  // Supprimer un produit
  const handleRemove = async (id_produit) => {
    try {
      await axiosInstance.delete(`/cart/delete/${id_produit}`);
      loadCart();
    } catch (err) {
      // alert("Erreur lors de la suppression du produit.", err);
      toast.error('Erreur lors de la suppression du produit.',
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

  // Vider le panier
  const handleClearCart = async () => {
    try {
      await axiosInstance.delete('/cart/clear');
      loadCart();
    } catch (err) {
      // alert("Erreur lors du vidage du panier.", err);
      toast.error('Erreur lors du vidage du panier.',
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

  const handleCheckout = () => {
    navigate('/checkout', {
      state: {
        cartTotal: total,
        cartItems: cartItems,
      }
    });
  };

  if (error === "Vous devez être connecté pour accéder à votre panier.") {
    return (
      <div className="text-center text-black dark:text-white min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <p className="mb-4 text-lg font-semibold text-red-400">{error}</p>
        <RedirectButton to="/login" className="w-fit px-6 py-2 ">
          Se connecter
        </RedirectButton>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        Chargement du panier...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {error}
      </div>
    );
  }

  return (
    <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Votre Panier</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-lg">Votre panier est vide</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonne gauche : Liste des articles */}
            <div className="w-full md:w-2/3">
              <CartList items={cartItems} onRemove={handleRemove} />
            </div>

            {/* Colonne droite : Résumé + boutons */}
            <div className="w-full md:w-1/3">
              <CartSummary total={total} />

              <div className="mt-6 flex flex-col gap-4">
                <button
                  onClick={handleCheckout}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Procéder au paiement
                </button>
                <button
                  onClick={handleClearCart}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;