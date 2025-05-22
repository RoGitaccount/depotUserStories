import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartList from '../components/Cart/CartList';
import CartSummary from '../components/Cart/CartSummary';
import { cartService } from '../services/api';
import './Cart.css';  // Ajoutez cette ligne en haut du fichier
import axios from 'axios';

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
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data);
      // Calculer le total
      const cartTotal = data.reduce((sum, item) => sum + parseFloat(item.prix), 0);
      setTotal(cartTotal);
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      setError('Impossible de charger le panier');
    } finally {
      setLoading(false);
    }
  };

    // Supprimer un produit
    const handleRemove = async (id_produit) => {
      try {
        await axios.delete(`http://localhost:8001/api/cart/delete/${id_produit}`);
        loadCart();
      } catch (err) {
        alert("Erreur lors de la suppression du produit.",err);
      }
    };

    // Vider le panier
    const handleClearCart = async () => {
      try {
        await axios.delete('http://localhost:8001/api/cart/clear');
        loadCart();
      } catch (err) {
        alert("Erreur lors du vidage du panier.",err);
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

  if (loading) {
    return <div>Chargement du panier...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cart-page">
      <h1>Votre Panier</h1>
      <CartList items={cartItems} onRemove={handleRemove}/>
      <CartSummary total={total} />
      {cartItems.length > 0 && (
      <>
        <button onClick={handleCheckout} className="checkout-button">
          Procéder au paiement
        </button>
        <button onClick={handleClearCart} className="clear-cart-button">
          Vider le panier
        </button>
      </>
      )}
    </div>
  );
};

export default CartPage;