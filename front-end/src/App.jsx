// import Offers from './components/offer';

// function App() {
//   return (
//     <div className="App">
//       <Offers />
//     </div>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';

// Components //
import Navbar from './components/Navbar';
import Offers from './components/offer'
import CategoryList from './components/category'
import Register from './components/register'

// Page //

import Dashboard from './pages/dashboard'
import Login from './pages/login'
import VerifyCodeLogin from './components/login-verifycode'
import ForgotPassword from './components/forgot-password'


function App() {
  return (
/*     <Router>
      <div className="App"> <nav> <Link to="/">Promotions</Link> | <Link to="/categories">Catégories</Link>  | <Link to="/register">Inscription</Link> | <Link to="/login">Connexion</Link> </nav>
        <Routes>
          <Route path="/" element={<Offers />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-code" element={<VerifyCodeLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router> */
  
  <AuthProvider>
    <Router>
      <Navbar />
        <Routes>
        
          <Route path="/promotions" element={<Offers/>} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-code" element={<VerifyCodeLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
    </Router>
  </AuthProvider>

) }

export default App