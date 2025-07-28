
import React from 'react';
import { Link } from 'react-router-dom';

const WishlistList = ({ items, onRemove, onAddToCart, stock }) => {
  if (!items || items.length === 0) {
    return <p className="text-center text-lg mt-6">Votre wishlist est vide</p>;
  }

  //console.log(items);
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
            {Number(item.stock) > 0 ? (

            <button
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            onClick={() => onAddToCart(item.id_produit)}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ajouter au panier
            </button>
            ):(
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 border border-red-300 rounded-md shadow-sm">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                </svg>
                <span className="font-semibold text-sm">Rupture de stock</span>
              </div>
            )}
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
