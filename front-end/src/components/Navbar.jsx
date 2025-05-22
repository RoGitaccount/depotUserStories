// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/promotions">Promotions</Link></li>
        <li><Link to="/categories">Catégories</Link></li>
        <li><Link to="/cart">Panier</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
        <li><Link to="/checkout">Checkout</Link></li>
        {/* Affichage conditionnel selon l'état de connexion */}
        {isAuthenticated ? (
          <li><button onClick={logout}>Déconnexion</button></li>
        ) : (
          <>
          <li><Link to="/register">Inscription</Link></li>
          <li><Link to="/login">Connexion</Link></li>
        </>
              )}
      </ul>
    </nav>
  );
};

export default Navbar;
