// TODO

// faire le handleSearch() pour faire une recherche en utilisant l'API

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Sun, Moon, ShoppingCart, Heart, CreditCard, User, Grid, ShieldCheck, LogIn, UserPlus, LogOut, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Délai pour éviter que le clic du bouton hamburger ferme immédiatement le menu
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSearch = () => {
    console.log("Recherche :", search);
    // TODO: Ajout appel API
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Style commun pour icônes
  const iconClass = "inline-block mr-1 align-middle";

  return (
    <>
      <nav className="w-full bg-white/80 dark:bg-gray-800 shadow flex items-center justify-between px-4 py-2 sticky top-0 z-20 mobile-menu-container">
        {/* Logo */}
        <div className="flex items-center">
          <Link 
            to="/" 
            className="group flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Cyna
            </span>
          </Link>
        </div>

        {/* Navigation Desktop - Cachée sur mobile */}
        <div className="hidden lg:flex items-center space-x-2">
          {isAuthenticated && (
            <>
              <Link 
                to="/cart" 
                className="flex items-center px-4 py-2 rounded-lg text-[#646cff] hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
              >
                <ShoppingCart size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Panier</span>
              </Link>

              <Link 
                to="/wishlist" 
                className="flex items-center px-4 py-2 rounded-lg text-[#646cff] hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300 transition-all duration-200"
              >
                <Heart size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Wishlist</span>
              </Link>

              <Link 
                to="/checkout" 
                className="flex items-center px-4 py-2 rounded-lg text-[#646cff] hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
              >
                <CreditCard size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Checkout</span>
              </Link>

              <Link 
                to="/dashboard" 
                className="flex items-center px-4 py-2 rounded-lg text-[#646cff] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
              >
                <User size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Mon compte</span>
              </Link>
            </>
          )}

          <Link 
            to="/catalog" 
            className="flex items-center px-4 py-2 rounded-lg text-[#646cff] hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
          >
            <Grid size={18} className={iconClass} />
            <span className="ml-2 font-semibold">Catalogue</span>
          </Link>

          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              className="flex items-center px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-400/90 dark:hover:text-red-300 transition-all duration-200"
            >
              <ShieldCheck size={18} className={iconClass} />
              <span className="ml-2 font-semibold">Admin</span>
            </Link>
          )}

          {!isAuthenticated && (
            <>
              <Link 
                to="/register" 
                className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-300 text-white hover:text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <UserPlus size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Inscription</span>
              </Link>

              <Link 
                to="/login" 
                className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white hover:text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <LogIn size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Connexion</span>
              </Link>
            </>
          )}
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Barre de recherche - Responsive */}
          <div className="relative">
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Search size={18} />
            </button>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Recherche..."
              className="w-32 sm:w-48 lg:w-64 pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-400 transition-all duration-200 hover:bg-white dark:hover:bg-gray-800"
            />
          </div>

          {/* Toggle Light/Dark */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full bg-gradient-to-br from-orange-500 to-yellow-300 dark:from-indigo-600 dark:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
            title="Changer le mode clair/sombre"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Déconnexion Desktop */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-400/90 dark:hover:text-red-300 transition-all duration-200"
            >
              <LogOut size={16} className={iconClass} /> 
              <span className="ml-2 font-semibold">Déconnexion</span>
            </button>
          )}

          {/* Bouton Menu Mobile */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border-t border-gray-200 dark:border-gray-700 z-30 mobile-menu-container">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated && (
              <>
                <Link 
                  to="/cart" 
                  className="flex items-center px-4 py-3 rounded-lg text-[#646cff] hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Panier</span>
                </Link>

                <Link 
                  to="/wishlist" 
                  className="flex items-center px-4 py-3 rounded-lg text-[#646cff] hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Wishlist</span>
                </Link>

                <Link 
                  to="/checkout" 
                  className="flex items-center px-4 py-3 rounded-lg text-[#646cff] hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Checkout</span>
                </Link>

                <Link 
                  to="/dashboard" 
                  className="flex items-center px-4 py-3 rounded-lg text-[#646cff] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Mon compte</span>
                </Link>
              </>
            )}

            <Link 
              to="/catalog" 
              className="flex items-center px-4 py-3 rounded-lg text-[#646cff] hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Grid size={18} className={iconClass} />
              <span className="ml-2 font-semibold">Catalogue</span>
            </Link>

            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className="flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-400/90 dark:hover:text-red-300 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShieldCheck size={18} className={iconClass} />
                <span className="ml-2 font-semibold">Admin</span>
              </Link>
            )}

            {!isAuthenticated && (
              <>
                <Link 
                  to="/register" 
                  className="flex items-center px-4 py-3 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-300 text-white hover:text-white shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Inscription</span>
                </Link>

                <Link 
                  to="/login" 
                  className="flex items-center px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white hover:text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn size={18} className={iconClass} />
                  <span className="ml-2 font-semibold">Connexion</span>
                </Link>
              </>
            )}

            {/* Déconnexion Mobile */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-400/90 dark:hover:text-red-300 transition-all duration-200"
              >
                <LogOut size={16} className={iconClass} /> 
                <span className="ml-2 font-semibold">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;