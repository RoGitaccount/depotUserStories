import React from "react";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center p-6 bg-white/80 dark:bg-gray-900 shadow-inner space-y-2">
      <div className="text-xl font-bold text-indigo-700 dark:text-indigo-200">MyShop</div>
      <nav className="space-x-6 text-indigo-600 dark:text-indigo-300 font-medium">
        <a href="#" className="hover:text-pink-500 transition">Accueil</a>
        <a href="#" className="hover:text-pink-500 transition">Boutique</a>
        <a href="#" className="hover:text-pink-500 transition">Contact</a>
        <a href="#" className="hover:text-pink-500 transition">À propos</a>
      </nav>
      <div className="flex space-x-4 mt-2 text-2xl">
        <a href="#" className="hover:text-pink-500 transition">📸</a>
        <a href="#" className="hover:text-blue-600 transition">📘</a>
        <a href="#" className="hover:text-sky-400 transition">🐦</a>
      </div>
      <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
        © 2025 MyShop. Tous droits réservés. | <a href="#" className="underline">Politique de confidentialité</a> | <a href="#" className="underline">Conditions d'utilisation</a>
      </p>
    </footer>
  );
}