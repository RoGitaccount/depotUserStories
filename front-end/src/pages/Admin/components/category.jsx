import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nom_categorie: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://localhost:8001/api/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Erreur récupération catégories :", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = editingId ? "put" : "post";
    const url = editingId
      ? `http://localhost:8001/api/category/update/${editingId}`
      : "http://localhost:8001/api/category/add";

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    axios({ method, url, data: form, headers })
      .then(() => axios.get("http://localhost:8001/api/category"))
      .then((res) => {
        setCategories(res.data);
        setForm({ nom_categorie: "", description: "" });
        setEditingId(null);
      })
      .catch((err) => console.error("Erreur lors de la soumission :", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      axios
        .delete(`http://localhost:8001/api/category/delete/${id}`, { headers })
        .then(() => {
          setCategories(categories.filter((cat) => cat.id_categorie !== id));
        })
        .catch((err) => console.error("Erreur lors de la suppression :", err));
    }
  };

  const handleEdit = (cat) => {
    setForm({
      nom_categorie: cat.nom_categorie,
      description: cat.description || "",
    });
    setEditingId(cat.id_categorie);
  };

const filteredCategories = categories
  .filter((cat) =>
    cat.nom_categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  .sort((a, b) =>
    a.nom_categorie.localeCompare(b.nom_categorie, 'fr', { sensitivity: 'base' })
  );

  // 🧠 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


const highlightText = (text, term) => {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <mark key={index} className="bg-yellow-400 dark:bg-yellow-300">{part}</mark> : part
  );
};


  return (
    <div className="text-black dark:text-white min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des catégories</h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Formulaire */}
        <div className="md:w-1/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Modifier" : "Ajouter"} une catégorie
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nom_categorie"
              placeholder="Nom de la catégorie"
              value={form.nom_categorie}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
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
                    setForm({ nom_categorie: "", description: "" });
                  }}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des catégories */}
        <div className="md:w-2/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[580px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Liste des catégories</h3>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">Nom</th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((cat) => (
                  <tr
                    key={cat.id_categorie}
                    className="hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">{highlightText(cat.nom_categorie, searchTerm)}</td>
                    <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                        {cat.description
                        ? highlightText(cat.description, searchTerm)
                        : <span className="italic text-gray-400">Aucune description</span>}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2 border-gray-400 dark:border-gray-500">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id_categorie)}
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

export default CategoryList;
