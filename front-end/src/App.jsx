import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components //
import Navbar from './components/PageComponents/Navbar';
import Offers from './components/Offer/offer'
import CategoryList from './components/Category/category'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/promotions" element={
              <AdminRoute>
                <Offers/>
              </AdminRoute>
            } />
            <Route path="/categories" element={
              <AdminRoute>
                <CategoryList />
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
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/produit/:id" element={<ProductDetailPage />} />
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