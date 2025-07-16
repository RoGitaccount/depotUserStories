import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../services/axiosInstance";

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({
    code: "",
    montant_reduction: "",
    date_expiration: "",
    est_actif: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // Récupérer toutes les promotions admin
  // useEffect(() => {
  //   // const token = localStorage.getItem("token");
  //   axios.get("http://localhost:8001/api/offers", {
  //       // headers: { Authorization: `Bearer ${token}` },
  //        withCredentials: true
  //     })
  //     .then((res) => setPromotions(res.data))
  //     .catch((err) => console.error("Erreur récupération promos :", err.response?.data || err.message));
  // }, []);

  useEffect(() => {
  axiosInstance
    .get("/offers")
    .then((res) => setPromotions(res.data))
    .catch((err) =>
      console.error("Erreur récupération promos :", err.response?.data || err.message)
    );
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // const token = localStorage.getItem("token");

  //   // Prépare les données à envoyer en forçant le type des champs
  //   const dataToSend = {
  //       ...form,
  //       montant_reduction: Number(form.montant_reduction), // force number
  //       est_actif: form.est_actif, // assure un booléen
  //   };

  //   console.log(form.est_actif);

  //   const method = editingId ? "put" : "post";
  //   const url = editingId
  //     ? `http://localhost:8001/api/offers/update/${editingId}`
  //     : "http://localhost:8001/api/offers/add";

  //   axios({
  //     method,
  //     url,
  //     data: dataToSend,
  //     // headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then(() => {
  //       return axios.get("http://localhost:8001/api/offers", {
  //         // headers: { Authorization: `Bearer ${token}` },
  //         withCredentials: true
  //       });
  //     })
  //     .then((res) => {
  //       setPromotions(res.data);
  //       setForm({
  //         code: "",
  //         montant_reduction: "",
  //         date_expiration: "",
  //         est_actif: 0,
  //       });
  //       setEditingId(null);
  //     })
  //     .catch((err) => console.error("Erreur lors de la soumission :", err));
  // };

  const handleSubmit = (e) => {
  e.preventDefault();

  const dataToSend = {
    ...form,
    montant_reduction: Number(form.montant_reduction),
    est_actif: form.est_actif,
  };

  const method = editingId ? "put" : "post";
  const url = editingId
    ? `/offers/update/${editingId}`
    : "/offers/add";

  axiosInstance({
    method,
    url,
    data: dataToSend,
  })
    .then(() => axiosInstance.get("/offers"))
    .then((res) => {
      setPromotions(res.data);
      setForm({
        code: "",
        montant_reduction: "",
        date_expiration: "",
        est_actif: 0,
      });
      setEditingId(null);
    })
    .catch((err) => console.error("Erreur lors de la soumission :", err));
};




  // const handleDelete = (id) => {
  //   if (window.confirm("Supprimer cette promotion ?")) {
  //     // const token = localStorage.getItem("token");
  //     axios
  //       .delete(`http://localhost:8001/api/offers/delete/${id}`, {
  //         // headers: { Authorization: `Bearer ${token}` },
  //          withCredentials: true
  //       })
  //       .then(() => {
  //         setPromotions(promotions.filter((promo) => promo.id_promotion !== id));
  //       })
  //       .catch((err) => console.error("Erreur lors de la suppression :", err));
  //   }
  // };

  const handleDelete = (id) => {
  if (window.confirm("Supprimer cette promotion ?")) {
    axiosInstance
      .delete(`/offers/delete/${id}`)
      .then(() => {
        setPromotions(promotions.filter((promo) => promo.id_promotion !== id));
      })
      .catch((err) => console.error("Erreur lors de la suppression :", err));
  }
};


  const handleEdit = (promo) => {
    setForm({
      code: promo.code,
      montant_reduction: promo.montant_reduction.toString(),
      date_expiration: promo.date_expiration?.slice(0, 10) || "",
      est_actif: promo.est_actif,
    });
    setEditingId(promo.id_promotion);
  };

  // Filtrer et trier par code promo (tu peux ajuster le filtre sur d'autres champs)
  const filteredPromotions = promotions
    .filter((promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((promo) => (filterActiveOnly ? promo.est_actif === 1 : true))
    .sort((a, b) => a.code.localeCompare(b.code, "fr", { sensitivity: "base" }));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        // <mark key={index} className="bg-yellow-400 dark:bg-yellow-300">
        // {part}
        // </mark>
        <span key={index} className="bg-yellow-300 text-black rounded px-1">
          {part}
        </span>
        
      ) : (
        part
      )
    );
  };

  return (
    <div className="text-black dark:text-white min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des promotions</h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Formulaire */}
        <div className="md:w-1/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Modifier" : "Ajouter"} une promotion
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="code"
              placeholder="Code promotion"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              name="montant_reduction"
              placeholder="Montant de réduction"
              value={form.montant_reduction}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="date"
              name="date_expiration"
              placeholder="Date d'expiration"
              value={form.date_expiration}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="est_actif"
                checked={form.est_actif}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Promotion active</span>
            </label>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingId ? "Mettre à jour" : "Ajouter"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      code: "",
                      montant_reduction: "",
                      date_expiration: "",
                      est_actif: 0,
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des promotions */}
        <div className="md:w-2/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[580px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Liste des promotions</h3>
            <input
              type="text"
              placeholder="Rechercher par code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-between items-center mb-4 space-x-4">
            <label className="flex items-center space-x-2 text-sm dark:text-gray-300">
              <input
                type="checkbox"
                checked={filterActiveOnly}
                onChange={() => setFilterActiveOnly(!filterActiveOnly)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Afficher uniquement les promotions actives</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">
                    Code
                  </th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">
                    Montant réduction
                  </th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">
                    Date expiration
                  </th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-center">
                    Actif
                  </th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPromotions.map((promo) => (
                  <tr
                    key={promo.id_promotion}
                    className="hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                      {highlightText(promo.code, searchTerm)}
                    </td>
                    <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                    {Number(promo.montant_reduction).toFixed(2)} %
                    </td>
                    <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                      {new Date(promo.date_expiration).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="border px-4 py-2 text-center border-gray-400 dark:border-gray-500">
                      {promo.est_actif == 1 ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          Oui
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          Non
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2 border-gray-400 dark:border-gray-500">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id_promotion)}
                        className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm">
                Page {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionList;