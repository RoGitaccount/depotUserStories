import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Applique le mode sombre au chargement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white/80 dark:bg-gray-800 shadow flex flex-col md:flex-row items-center justify-between px-4 py-2 sticky top-0 z-20">
      <ul className="flex flex-wrap gap-4 items-center text-gray-800 dark:text-white">
        <li className="font-bold text-xl text-indigo-700 dark:text-indigo-200"><Link to="/">MyShop</Link></li>
        <li><Link to="/">Accueil</Link></li>
        {user?.role === "admin" && (
          <>
            <li><Link to="/promotions">Promotions</Link></li>
            <li><Link to="/categories">Catégories</Link></li>
          </>
        )}
        <li><Link to="/cart">Panier</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
        <li><Link to="/checkout">Checkout</Link></li>
        <li><Link to="/catalogue">Catalogue</Link></li>
        {isAuthenticated ? (
          <li><button onClick={handleLogout} className=" text-red-500 hover:text-red-800 font-semibold">
            Déconnexion
          </button></li>
        ) : (
          <>
            <li><Link to="/register">Inscription</Link></li>
            <li><Link to="/login">Connexion</Link></li>
          </>
        )}
      </ul>

      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche..."
          className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
        />

        {/* Toggle Light/Dark */}
        <button
          onClick={toggleDarkMode}
          className="dark-toggle-btn bg-gray-700 text-white dark:text-gray-800 p-2 rounded-full hover:bg-gray-700 hover:text-yellow-400 dark:hover:text-yellow-400 dark:bg-white dark:hover:bg-white transition"
          title="Changer le mode clair/sombre"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
