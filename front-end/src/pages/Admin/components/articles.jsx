import React, { useEffect, useState } from "react";
import axios from "axios";

const ArticlesManagement = () => {
    const [categories, setCategories] = useState([]);

    const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    //
    const filteredCategories = categories
  .filter((cat) =>
    cat.nom_categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  .sort((a, b) =>
    a.nom_categorie.localeCompare(b.nom_categorie, 'fr', { sensitivity: 'base' })
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    //

    const [selectedCategories, setSelectedCategories] = useState([]);

    const highlightText = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, "gi");
        return text.split(regex).map((part, index) =>
          regex.test(part) ? <mark key={index} className="bg-yellow-400 dark:bg-yellow-300">{part}</mark> : part
        );
      };

    const [articles, setArticles] = useState([]);
        const [form, setForm] = useState({
        id_produit: null,
        titre: "",
        description: "",
        prix: "",
        image: null, // fichier image (Blob)
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  // Charger les articles
  const fetchArticles = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/products");
      setArticles(res.data);
    } catch (err) {
      console.error("Erreur récupération articles:", err);
      setError("Erreur chargement des articles");
    }
  };
  
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/category");
      console.log("Catégories récupérées :", res.data); // <== AJOUTE ICI
      setCategories(res.data);
    } catch (err) {
      console.error("Erreur récupération catégories:", err);
      setError("Erreur chargement des catégories");
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  // Gestion des champs texte/number
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Gestion du champ image (fichier)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((f) => ({ ...f, image: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Soumission ajout / modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Pas de Content-Type, axios le définit automatiquement pour FormData
    };
    console.log("Catégories sélectionnées :", selectedCategories);

    try {
      // Utiliser FormData pour envoyer le fichier image
      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);
      formData.append("prix", form.prix);

      selectedCategories.forEach((id) => {
        formData.append("id_categories", id);
      });

      if (form.image) {
        formData.append("image", form.image);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (editing) {
        // Modifier - pour PUT avec multipart/form-data, certains serveurs préfèrent PATCH, à vérifier backend
        await axios.put(
          `http://localhost:8001/api/products/update/${form.id_produit}`,
          formData,
          { headers }
        );
      } else {
        // Ajouter
        await axios.post("http://localhost:8001/api/products/add", formData, { headers });
      }

      await fetchArticles();
      setForm({ id_produit: null, titre: "", description: "", prix: "", image: null, id_categorie: "" }); // reset du formulaire sur le front
      setSelectedCategories([]);
      setPreviewImage(null);
      setEditing(false);
    } catch (err) {
      console.error("Erreur sauvegarde article:", err);
      setError("Erreur lors de l'enregistrement");
    }
    setLoading(false);
  };

  const handleEdit = async (article) => {
    setForm({
      id_produit: article.id_produit,
      titre: article.titre,
      description: article.description || "",
      prix: article.prix,
      image: null, // Pas de modification d’image pour simplifier ici
    });
    setPreviewImage(null);
    setEditing(true);
  
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
    try {
      const res = await axios.get(
        `http://localhost:8001/api/productCategory/produit/${article.id_produit}`,
        { headers }
      );
      //console.log("Catégories associées :", res.data.map(c => c.id_categorie));
      setSelectedCategories(res.data.map(c => c.id_categorie)); // ex: [1, 3, 5]
    } catch (err) {
      console.error("Erreur récupération des catégories de l'article :", err);
    }
  };
  

  // Supprimer un article
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        await axios.delete(`http://localhost:8001/api/products/delete/${id}`, { headers });
        setArticles(articles.filter((a) => a.id_produit !== id));
      } catch (err) {
        console.error("Erreur suppression article:", err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  return (
    <section className="p-6 bg-white dark:bg-gray-800 rounded shadow-md max-w-7xl mx-auto w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Gestion des articles</h2>
  
      <div className="flex gap-8">
        {/* Partie gauche : Formulaire */}
        <div className="w-1/2 overflow-y-auto max-h-[85vh]">
          {/* Formulaire ajout/modif */}
          <form onSubmit={handleSubmit} className="mb-6 space-y-4" encType="multipart/form-data">
            <input
              type="text"
              name="titre"
              placeholder="Titre"
              value={form.titre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              name="prix"
              placeholder="Prix"
              value={form.prix}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
            />
  
            {/* Liste des catégories avec sélection multiple */}
            <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[380px] overflow-y-auto">
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
                      <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-center">Sélection</th>
                      <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">Nom</th>
                      <th className="border border-gray-600 dark:border-gray-200 px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategories.map((cat) => (
                      <tr
                        key={cat.id_categorie}
                        className="hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        <td className="border px-4 py-2 border-gray-400 dark:border-gray-500 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id_categorie)}
                            onChange={() => {
                              if (selectedCategories.includes(cat.id_categorie)) {
                                setSelectedCategories(selectedCategories.filter(id => id !== cat.id_categorie));
                              } else {
                                setSelectedCategories([...selectedCategories, cat.id_categorie]);
                              }
                            }}
                            aria-label={`Sélectionner catégorie ${cat.nom_categorie}`}
                          />
                        </td>
                        <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                          {highlightText(cat.nom_categorie, searchTerm)}
                        </td>
                        <td className="border px-4 py-2 border-gray-400 dark:border-gray-500">
                          {cat.description
                            ? highlightText(cat.description, searchTerm)
                            : <span className="italic text-gray-400">Aucune description</span>}
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
  
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-gray-700 dark:text-gray-300"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-2 max-h-40 rounded border"
                />
              )}
            </div>
  
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editing ? "Mettre à jour" : "Ajouter"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({ id_produit: null, titre: "", description: "", prix: "", image: null });
                    setPreviewImage(null);
                    setError(null);
                  }}
                  className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
  
        {/* Partie droite : Liste des articles */}
        <div className="w-1/2 max-h-[85vh] overflow-y-auto">
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <ul className="space-y-2">
            {articles.map((article) => (
              <li
                key={article.id_produit}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <strong>{article.titre}</strong>
                  <p className="text-sm">{article.description}</p>
                  <p className="text-sm">Prix : {article.prix} €</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(article.id_produit)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
  
};

export default ArticlesManagement;
