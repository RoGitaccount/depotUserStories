import React from 'react';
import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
<div className=" items-center justify-center  text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <h1 className="text-4xl font-bold mb-6">Bienvenue sur notre site !</h1>
      <p className="mb-6 text-lg text-gray-700 text-center max-w-md dark:text-gray-300 transition-colors duration-300">
        Découvrez nos offres, produits et services. Connectez-vous pour accéder à votre tableau de bord.
      </p>
    </div>
  );
}