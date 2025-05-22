import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider';

// Components //
import Navbar from './components/Navbar';
import Offers from './components/offer'
import CategoryList from './components/category'
import Register from './components/register'
import ForgotPassword from './components/forgot-password'
import VerifyCodeLogin from './components/login-verifycode'

// Page //
import Dashboard from './pages/dashboard'
import Login from './pages/login'
import ResetPassword from './pages/resetpassword'
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import Wishlist from './pages/WishlistPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/promotions" element={<Offers/>} />
            <Route path="/categories" element={<CategoryList />} />
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
          </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App