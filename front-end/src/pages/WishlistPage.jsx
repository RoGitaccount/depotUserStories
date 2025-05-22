import React, { useEffect, useState } from 'react';
import WishlistList from '../components/wishlist/Wishlist-list';
import './Wishlist.css'; 
import axios from 'axios';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8001/api/wishlist');
      setWishlist(res.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement de la wishlist");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id_produit) => {
    try {
      await axios.delete(`http://localhost:8001/api/wishlist/delete/${id_produit}`);
      loadWishlist();
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleClear = async () => {
    try {
      await axios.delete('http://localhost:8001/api/wishlist/clear');
      loadWishlist();
    } catch {
      alert("Erreur lors du vidage de la wishlist.");
    }
  };

  const handleAddToCart = async (id_produit) => {
    try {
      await axios.post(`http://localhost:8001/api/wishlist/add_to_cart/${id_produit}`);
      loadWishlist();
    } catch {
      alert("Erreur lors de l'ajout au panier.");
    }
  };

  const handleAddAllToCart = async () => {
    try {
      await axios.post('http://localhost:8001/api/wishlist/add_all_to_cart');
      loadWishlist();
    } catch {
      alert("Erreur lors de l'ajout de tous les produits au panier.");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="wishlist-page">
      <h1>Ma Wishlist</h1>
      <WishlistList items={wishlist} onRemove={handleRemove} onAddToCart={handleAddToCart} />
      {wishlist.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={handleAddAllToCart} className="add_all_to_cart_button">
            Ajouter tous les produits au panier
          </button>
          <button onClick={handleClear} className="clear-wishlist-button">
            Vider la wishlist
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;