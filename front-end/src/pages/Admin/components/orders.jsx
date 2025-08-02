import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../services/axiosInstance";
import PopularCategoriesChart from "./stats/popular-categories";
import BestProductsByCategoryChart from "./stats/BestProductsByCategoryChart";
import SimpleBarChartSales from "./stats/sales_and_avg_basket";
import { toast, Bounce } from "react-toastify";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    statut: "en_attente",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // enum('en attente','payée','activée','annulée')
  const statutLabels = {
    en_attente: "En attente",
    payée: "Payée",
    annulée:"Annulée"
  };
  

  // Pour récupérer toutes les commandes (pas que de l'utilisateur) : GET /api/order/
  const fetchOrders = () => {
  axiosInstance
    .get("/order")
    .then((res) => {
      console.log("Commandes reçues :", res.data);
      setOrders(res.data || []);
    })
    .catch((err) => console.error("Erreur récupération commandes :", err));
};


  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const token = localStorage.getItem("token");
  
    if (!editingId) {
      // alert("Sélectionnez une commande à modifier.");
      toast.info('Sélectionnez une commande à modifier.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
      return;
    }
    axiosInstance.put(
      `/order/update/${editingId}`,
      { statut: form.statut, montant_total: parseFloat(form.total) }
    )
      .then(() => {
        fetchOrders();
        setForm({ statut: "en_attente", total: "" });
        setEditingId(null);
      })
      .catch((err) => console.error("Erreur mise à jour commande :", err));
  };
  

  const handleDelete = (id) => {
  if (window.confirm("Supprimer cette commande ?")) {
    axiosInstance
      .delete(`/order/details/${id}`)
      .then(() => {
        fetchOrders();
      })
      .catch((err) => console.error("Erreur suppression détails :", err));
  }
};


  const handleEdit = (order) => {
    // Le form a client, statut, total, mais ta commande côté backend n'a pas de champ client ?
    // Ici on utilise order.client (champ qui doit exister côté backend ou venant des données)
    setForm({
      client: order.prenom + " " + order.nom || "",
      statut: order.statut || "en_attente",
      total: order.montant_total ? order.montant_total.toString() : "",
    });
    console.log(form);
    setEditingId(order.id_commande);
  };

  const filteredOrders = orders
  .filter((o) => {
    const fullName = `${o.prenom || ""} ${o.nom || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  })
  .sort((a, b) => {
    const nameA = `${a.prenom || ""} ${a.nom || ""}`.toLowerCase();
    const nameB = `${b.prenom || ""} ${b.nom || ""}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  function highlightText(text, highlight) {
    if (!highlight) return text;
  
    // On met tout en minuscules pour comparer, mais on veut garder la casse originale
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
  
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-300 text-black rounded px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

return (
  <div className="text-black dark:text-white min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
    <h2 className="text-2xl font-bold mb-6">Gestion des commandes</h2>

    <div className="flex flex-col md:flex-row gap-8">
      {/* Colonne de gauche */}
      <div className="md:w-1/3 w-full flex flex-col gap-8">
        {/* Sélection commande */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4">Sélectionner une commande</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="client"
              placeholder="Nom du client"
              value={form.client}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
              disabled
            />
            <input
              name="total"
              placeholder="Total (€)"
              value={form.total}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
              disabled
            />
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="payee">Payée</option>
              <option value="echouee">Échouée</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Mettre à jour
            </button>
          </form>
        </div>

        {/* Graphiques sous le formulaire */}
        <div>
          <PopularCategoriesChart />
        </div>
        <div>
          <BestProductsByCategoryChart />
        </div>
      </div>

      {/* Colonne de droite */}
      <div className="md:w-2/3 w-full flex flex-col gap-8">
        {/* Liste des commandes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[580px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Liste des commandes</h3>
            <input
              placeholder="Rechercher client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <table className="min-w-full table-auto border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border">Client</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Statut</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
              {currentOrders.map((order) => (
                <tr
                  key={order.id_commande}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2 border">
                    {highlightText(`${order.prenom || ""} ${order.nom || ""}`, searchTerm)}
                  </td>
                  <td className="px-4 py-2 border">
                    {order.montant_total
                      ? Number(order.montant_total).toFixed(2) + " €"
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border capitalize">
                    {statutLabels[order.statut] || "-"}
                  </td>
                  <td className="border px-4 py-2 text-center space-x-2 border-gray-400 dark:border-gray-500">
                    <button
                      onClick={() => handleEdit(order)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(order.id_commande)}
                      className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                    >
                      Supprimer détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-3 py-1">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Graphique des ventes */}
        <div>
          <SimpleBarChartSales />
        </div>
      </div>
    </div>
  </div>
);


};

export default OrderList;