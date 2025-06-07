
import React from 'react';
import { Link } from 'react-router-dom';

const WishlistList = ({ items, onRemove, onAddToCart }) => {
  if (!items || items.length === 0) {
    return <p className="text-center text-lg mt-6">Votre wishlist est vide</p>;
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.id_produit}
          className="flex items-start gap-6 border-b border-gray-300 dark:border-gray-500 pb-6 bg-white dark:bg-gray-800 p-4 rounded">
          {/* Lien sur l'image */}
          <Link to={`/produit/${item.id_produit}`}>
            <img
              src={item.image_url}
              alt={item.titre}
              className="w-28 h-28 object-cover rounded shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 p-1  hover:scale-105 hover:opacity-90 transition duration-200 ease-in-out"
            />
          </Link>

          <div className="flex-1 space-y-2">
            {/* Lien sur le titre */}
            <Link to={`/produit/${item.id_produit}`}>
              <h3 className="text-xl font-semibold hover:underline inline-block">
                {item.titre}
              </h3>
            </Link>

            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {item.prix} €
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ajouté le : {new Date(item.date_ajout).toLocaleDateString()}
            </p>
            <div className="flex gap-3 mt-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                onClick={() => onAddToCart(item.id_produit)}
              >
                Ajouter au panier
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                onClick={() => onRemove(item.id_produit)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistList;
