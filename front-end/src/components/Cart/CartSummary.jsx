import React from 'react';

const CartSummary = ({ total = 0, reduction = 0, reductionPercent = 0 }) => {
  const TVA = 0.2; // taux par défaut à 20%
  const sousTotal = total;
  const montantTVA = sousTotal * TVA;
  const prixTTC = sousTotal + montantTVA;
  const montantReduction = reduction;
  const prixTTCAvecPromo = (sousTotal - reduction) * (1 + TVA);

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-md transition-colors duration-300 bg-white dark:bg-gray-800/80 backdrop-blur">
      <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>

      <div className="flex justify-between py-1 border-b border-gray-300 dark:border-gray-700">
        <span>Sous-total (HT)</span>
        <span>{sousTotal.toFixed(2)}€</span>
      </div>

      <div className="flex justify-between py-1 border-b border-gray-300 dark:border-gray-700">
        <span>TVA (20%)</span>
        <span>{montantTVA.toFixed(2)}€</span>
      </div>

      <div className="flex justify-between py-1 border-b border-gray-300 dark:border-gray-700">
        <span>Prix TTC (sans promo)</span>
        <span>{prixTTC.toFixed(2)}€</span>
      </div>

      {montantReduction > 0 && (
        <>
          <div className="flex justify-between py-1 text-red-600 dark:text-red-400 border-b border-gray-300 dark:border-gray-700">
            <span>Réduction ({reductionPercent}%)</span>
            <span>-{montantReduction.toFixed(2)}€</span>
          </div>

          <div className="flex justify-between py-1 font-semibold text-green-700 dark:text-green-400">
            <span>Prix TTC avec promo</span>
            <span>{prixTTCAvecPromo.toFixed(2)}€</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;
