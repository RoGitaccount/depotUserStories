import React from 'react';

const WishlistList = ({ items, onRemove, onAddToCart }) => {
  if (!items || items.length === 0) {
    return <p>Votre wishlist est vide</p>;
  }

  return (
    <div className="wishlist-list">
      {items.map((item) => (
        <div key={item.id_produit} className="wishlist-item">
          <img src={item.image_url} alt={item.titre} />
          <div className="wishlist-item-details">
            <h3>{item.titre}</h3>
            <p className="price">{item.prix}€</p>
            <p>Ajouté le: {new Date(item.date_ajout).toLocaleDateString()}</p>
            <button onClick={() => onAddToCart(item.id_produit)}>
              Ajouter au panier
            </button>
            <button onClick={() => onRemove(item.id_produit)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistList;