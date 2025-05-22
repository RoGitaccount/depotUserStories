import React from 'react';

const CartList = ({ items,onRemove }) => {
  if (!items || items.length === 0) {
    return <p>Votre panier est vide</p>;
  }

  return (
    <div className="cart-list">
      {items.map((item) => (
        <div key={item.id_produit} className="cart-item">
          <img src={item.image_url} alt={item.titre} />
          <div className="cart-item-details">
            <h3>{item.titre}</h3>
            <p className="price">{item.prix}€</p>
            <p>Ajouté le: {new Date(item.date_ajout).toLocaleDateString()}</p>
            <button onClick={() => onRemove(item.id_produit)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartList;