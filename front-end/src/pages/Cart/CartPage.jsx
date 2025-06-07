import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartList from '../../components/Cart/CartList';
import CartSummary from '../../components/Cart/CartSummary';
import { cartService } from '../../services/api';
import axios from 'axios';
import RedirectButton from '../../components/PageComponents/RedirectButton';




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
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté pour accéder à votre panier.");
      setLoading(false);
      return;
    }

    const res = await axios.get('http://localhost:8001/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;
    setCartItems(data);

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
};



    // Supprimer un produit
  const handleRemove = async (id_produit) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `http://localhost:8001/api/cart/delete/${id_produit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    loadCart();
  } catch (err) {
    alert("Erreur lors de la suppression du produit.", err);
  }
  };

    // Vider le panier
  const handleClearCart = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      'http://localhost:8001/api/cart/clear',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    loadCart();
  } catch (err) {
    alert("Erreur lors du vidage du panier.", err);
  }
  };

  const handleCheckout = () => {
    // Passer les données via state dans la navigation
    navigate('/checkout', { 
      state: { 
        cartTotal: total,
        cartItems: cartItems
      } 
    });
  };

if (error === "Vous devez être connecté pour accéder à votre panier.") {
  return (
    <div className="text-center text-black dark:text-white min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <p className="mb-4 text-lg font-semibold text-red-400">{error}</p>
      <RedirectButton to="/login" className="w-fit px-6 py-2 " >
        Se connecter
      </RedirectButton>
    </div>
  );
}

  if (loading) {
    return <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">Chargement du panier...</div>;
  }

  if (error) {
    return <div className="error text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">{error}</div>;
  }

// return (
//   <div className="text-black dark:text-white min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Votre Panier</h1>

//       {cartItems.length === 0 ? (
//         <p className="text-center text-lg">Votre panier est vide</p>
//       ) : (
//         <div className="flex flex-col md:flex-row gap-8">
//           {/* Colonne de gauche - Liste du panier */}
//           <div className="flex-1">
//             <CartList items={cartItems} onRemove={handleRemove} />
//           </div>

//           {/* Colonne de droite - Résumé + boutons */}
//           <div className="w-full md:w-1/3 space-y-4">
//             <CartSummary total={total} />

//             <div className="flex flex-col gap-4"> {/* verticale sinon <div className="flex flex-col gap-4"> */}
//               <button
//                 onClick={handleCheckout}
//                 className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//               >
//                 Procéder au paiement
//               </button>
//               <button
//                 onClick={handleClearCart}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
//               >
//                 Vider le panier
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
// );


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