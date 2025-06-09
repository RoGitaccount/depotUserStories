import React, { useEffect } from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider';
import { ToastContainer, Bounce } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

// Components //
import Navbar from './components/PageComponents/Navbar';
import Register from './pages/Authentication/register'
import ForgotPassword from './components/Credentials/forgot-password'
import VerifyCodeLogin from './components/Credentials/login-verifycode'
import AdminRoute from './components/AdminRoute';

// Page //
import Accueil from './pages/Accueil'
import Dashboard from './pages/Dashboard/dashboard'
import Login from './pages/Authentication/login'
import ResetPassword from './pages/Authentication/resetpassword'
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Payment/CheckoutPage';
import SuccessPage from './pages/Payment/SuccessPage';
import Wishlist from './pages/Wishlist/WishlistPage';

import CataloguePage from './pages/Catalogue/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';

// Page Admin // 

import DashboardAdmin from './pages/Admin/dashboard_admin.jsx'
import CategoryList from './pages/Admin/components/category.jsx'
import Offers from './components/Offer/offer'

// Gestion de l'expiration des tokens // 
import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.message === "Token invalide ou expiré."
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirige vers la page de login
    }

    return Promise.reject(error);
  }
);


function App() {

 /*  useEffect(() => {
    const checkScroll = () => {
      if (document.body.scrollHeight > window.innerHeight) {
        // Contenu plus grand que la fenêtre => autoriser scroll
        document.body.style.overflow = 'auto';
      } else {
        // Contenu assez petit => désactiver scroll
        document.body.style.overflow = 'hidden';
      }
    };

    checkScroll(); // check au montage

    window.addEventListener('resize', checkScroll); // check au resize

    return () => {
      // Remettre overflow par défaut et enlever l'écouteur au démontage
      document.body.style.overflow = '';
      window.removeEventListener('resize', checkScroll);
    };
    
  }, []); */

  return (
    <AuthProvider>
      <Router>
        <Navbar />
          <Routes>

            <Route path="/admin" element={
              <AdminRoute>
                <DashboardAdmin />
              </AdminRoute>
            } />
            
            <Route path="/" element={<Accueil/>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register />} />
            <Route path="/resetpassword" element={<ResetPassword/>} />
            <Route path="/verify-code" element={<VerifyCodeLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/catalog" element={<CataloguePage />} />
            <Route path="/produit/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirection si un utilisateur va sur une route inconnue / non déclarée */}
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
      </Router>
    </AuthProvider>
  )
}

export default App