import axios from 'axios';

const API_URL = 'http://localhost:8001/api';

export const cartService = {
  getCart: async () => {
    // const response = await axios.get(`${API_URL}/cart`, {
    //       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } //pour le token faire de meme pour les autres
    //     });
      const response = await axios.get(`${API_URL}/cart`);
    return response.data;
  },

  applyPromo: async (promoCode) => {
    try {
      // Faire la vérification en une seule requête
      const verificationResponse = await axios.get(`${API_URL}/offers/verify/${promoCode}`);
      
      if (!verificationResponse.data.valid) {
        throw new Error(verificationResponse.data.error);
      }
  
      const promotion = verificationResponse.data.promotion;
  
      return {
        montant_reduction: promotion.montant_reduction,
        id_promotion: promotion.id_promotion,
        message: 'Code promo appliqué avec succès'
      };
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 404:
            throw new Error('Code promo invalide ou expiré');
          case 400:
            throw new Error(error.response.data.error);
          default:
            throw new Error(error.response.data.error || 'Erreur lors de la vérification du code promo');
        }
      }
      throw new Error('Erreur de connexion au serveur');
    }
  },

  checkout: async (orderData) => {
    // Ajout d'un id_user temporaire pour les tests
    const orderWithUser = {
      ...orderData,
      id_user: 1 // ID utilisateur de test
    };
    const response = await axios.post(`${API_URL}/order`, orderWithUser);
    return response.data;
  }
};