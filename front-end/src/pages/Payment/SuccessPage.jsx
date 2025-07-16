import React, { useEffect, useState,useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Success.css'
import axiosInstance from '../../services/axiosInstance';


const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  // le mode Strict en développement exécute les effets deux fois pour détecter les effets secondaires non sûrs.
  const alreadyProcessed = useRef(false); // Empêche les appels multiples 

  useEffect(() => {
    const processOrder = async () => {
      if (alreadyProcessed.current) return;
      alreadyProcessed.current = true;
      try {
        // Récupérer le session_id depuis l'URL
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          throw new Error('Session ID manquant');
        }

       await axiosInstance.post('/order/process-success', { sessionId });


        setLoading(false);
        
        // Rediriger vers la page d'accueil après 5 secondes
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);
        setError('Une erreur est survenue lors du traitement de votre commande.');
        setLoading(false);
      }
    };

    processOrder();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="success-page">
        <h1>Traitement de votre commande...</h1>
        <p>Veuillez patienter pendant que nous finalisons votre commande.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page error">
        <h1>Erreur</h1>
        <p>{error}</p>
        <p>
        <strong> votre paiement a bien été validé par notre prestataire mais n’a pas pu être enregistré dans notre système.</strong>
        <br />
        <strong>Un remboursement automatique sera effectué sous peu.</strong>
        <br />
        Merci de vous reconnecter et de réessayer, ou contactez le support si besoin.
      </p>
      </div>
    );
  }

  return (
    <div className="success-page">
      <h1>Commande confirmée !</h1>
      <p>Merci pour votre achat.</p>
      <p>Vous allez être redirigé vers la page d'accueil dans quelques secondes...</p>
    </div>
  );
};

export default SuccessPage;