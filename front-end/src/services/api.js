import axiosInstance from './axiosInstance';
import { getUserIdFromToken } from "./auth";

export const cartService = {
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      throw error;
    }
  },

  applyPromo: async (promoCode) => {
    try {
      const verificationResponse = await axiosInstance.get(`/offers/verify/${promoCode}`);
      
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
    try {
      const id_user = await getUserIdFromToken();
      
      if (!id_user) {
        throw new Error("Utilisateur non authentifié");
      }

      const orderWithUser = {
        ...orderData,
        id_user
      };

      const response = await axiosInstance.post('/order', orderWithUser);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
      throw error;
    }
  }
};