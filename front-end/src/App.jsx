import React from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastContainer, Bounce } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/PageComponents/Navbar';
import Register from './pages/Authentication/register';
import ForgotPassword from './components/Credentials/forgot-password';
import VerifyCodeLogin from './components/Credentials/login-verifycode';
import AdminRoute from './components/AdminRoute';

// Pages
import Accueil from './pages/Accueil';
import Dashboard from './pages/Dashboard/dashboard';
import Login from './pages/Authentication/login';
import ResetPassword from './pages/Authentication/resetpassword';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Payment/CheckoutPage';
import SuccessPage from './pages/Payment/SuccessPage';
import Wishlist from './pages/Wishlist/WishlistPage';
import CataloguePage from './pages/Catalogue/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/Contact/ContactPage';

// Pages supplémentaires
import MyDataPage from './pages/Dashboard/MyData';
import ConfirmEmailChange from './pages/Authentication/ConfirmEmailChange';

// Admin
import DashboardAdmin from './pages/Admin/dashboard_admin.jsx';
import CategoryList from './pages/Admin/components/category.jsx';
import Offers from './components/Offer/offer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCodeLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/catalog" element={<CataloguePage />} />
          <Route path="/produit/:id" element={<ProductDetailPage />} />
          <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />
          <Route path="/MyData" element={<MyDataPage />} />
          <Route path="/Contact" element={<ContactPage />} />

          <Route path="/admin" element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
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
  );
}

export default App;