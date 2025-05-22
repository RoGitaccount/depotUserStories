import React from 'react';

const CartSummary = ({ total = 0, reduction = 0, reductionPercent = 0 }) => {
  const TVA = 0.2; // 20% de TVA (ex. france)
  const sousTotal = total;
  const prixTTC = total * (1 + TVA);
  const montantReduction = reduction;
  const prixTTCAvecPromo = (total - reduction) * (1 + TVA);

  return (
    <div className="cart-summary">
      <h2>Résumé de la commande</h2>

      <div className="summary-line">
        <span>Sous-total (HT)</span>
        <span>{sousTotal.toFixed(2)}€</span>
      </div>

      <div className="summary-line">
        <span>Prix TTC (sans promo)</span>
        <span>{prixTTC.toFixed(2)}€</span>
      </div>

      {montantReduction > 0 && (
        <>
          <div className="summary-line discount">
            <span>Réduction ({reductionPercent}%)</span>
            <span>-{montantReduction.toFixed(2)}€</span>
          </div>
          <div className="summary-line total">
            <span>Prix TTC avec promo</span>
            <span>{prixTTCAvecPromo.toFixed(2)}€</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;