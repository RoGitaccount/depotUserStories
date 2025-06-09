import React, { useState } from "react";
import ArticlesManagement from "./components/articles.jsx"; // adapte le chemin si besoin
import CategoryList from "./components/category"; // adapte le chemin si besoin

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState("articles");

  const renderContent = () => {
    switch (activeTab) {
      case "articles":
        return <ArticlesManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "promotions":
        return <PromotionsManagement />;
      case "utilisateurs":
        return <UsersModeration />;
      case "commandes":
        return <OrdersManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab("articles")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "articles" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            📝 Articles
          </button>
          <button onClick={() => setActiveTab("categories")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "categories" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            📂 Catégories
          </button>
          <button onClick={() => setActiveTab("promotions")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "promotions" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            🎁 Promotions
          </button>
          <button onClick={() => setActiveTab("utilisateurs")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "utilisateurs" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            👥 Utilisateurs
          </button>
          <button onClick={() => setActiveTab("commandes")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "commandes" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            📦 Commandes
          </button>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">{renderContent()}</main>
    </div>
  );
};

const CategoriesManagement = () => {
  return (
    <div>
      <CategoryList />
    </div>
  );
};

// Promotions
const PromotionsManagement = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Gestion des promotions</h2>
      <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded">➕ Nouvelle promo</button>
      <ul className="space-y-2">
        <li className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
          <span>Promo été 2025 - 20% sur tout</span>
          <button className="bg-red-600 text-white px-3 py-1 rounded">Supprimer</button>
        </li>
      </ul>
    </section>
  );
};

// Utilisateurs
const UsersModeration = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Modération des utilisateurs</h2>
      <ul className="space-y-2">
        <li className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
          <span>Jean Dupont (jean@mail.com)</span>
          <button className="bg-red-600 text-white px-3 py-1 rounded">🛑 Bloquer</button>
        </li>
      </ul>
    </section>
  );
};

// Commandes
const OrdersManagement = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Gestion des commandes</h2>
      <ul className="space-y-2">
        <li className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
          <span>Commande #12345 - 3 articles</span>
          <button className="bg-blue-600 text-white px-3 py-1 rounded">🧾 Voir</button>
        </li>
      </ul>
    </section>
  );
};

export default DashboardAdmin;
