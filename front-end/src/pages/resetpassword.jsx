// ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
  
    try {
      // Attends la réponse avant de faire autre chose
      const response = await axios.post('http://localhost:8001/api/reset-password', { token, newPassword }, { headers: { 'Content-Type': 'application/json', }});
      
      // Si la requête réussit, affiche le succès
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/login'), 3000); // Redirection vers la page de connexion après 3 secondes
    } catch (err) {
      // Si la requête échoue, affiche l'erreur
      setError('Erreur lors de la réinitialisation du mot de passe.');
    }
  };
  

  return (
    <div>
      <h2>Réinitialiser votre mot de passe</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <div>
          <label>Confirmer le mot de passe</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit">Réinitialiser le mot de passe</button>
      </form>
    </div>
  );
};

export default ResetPassword;
