import React, { useState } from "react";
import ArticlesManagement from "./components/articles.jsx"; // adapte le chemin si besoin
import CategoryManagement  from "./components/category"; // adapte le chemin si besoin
import PromotionsManagement from "./components/promotions.jsx";
import LogsPage from "./components/logs.jsx";
import OrdersManagement from "./components/orders.jsx"
import UsersManagement from "./components/users.jsx"

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState("articles");

  const renderContent = () => {
    switch (activeTab) {
      case "articles":
        return <ArticlesManagement />;
      case "categories":
        return <CategoryManagement />;
      case "promotions":
        return <PromotionsManagement />;
      case "utilisateurs":
        return <UsersManagement  />;
      case "commandes":
        return <OrdersManagement />;
      case "logs":
        return <LogsPage/>;
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
          <button onClick={() => setActiveTab("logs")} className={`block w-full text-left px-4 py-2 rounded ${activeTab === "logs" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            🗒️ Logs
          </button>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">{renderContent()}</main>
    </div>
  );
};

export default DashboardAdmin;
