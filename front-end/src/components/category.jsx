import React, { useEffect, useState } from "react";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nom_categorie: "", description: "" });
  const [editingId, setEditingId] = useState(null); // null signifie ajout, sinon c'est une mise à jour

  // Récupération des catégories
  useEffect(() => {
    fetch("http://localhost:8001/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Erreur récupération catégories :", err));
  }, []);

  // Mise à jour des champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire (ajout ou mise à jour)
  const handleSubmit = (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:8001/api/category/update/${editingId}`
      : "http://localhost:8001/api/category/add";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la requête");
        return res.json();
      })
      .then(() => {
        // Recharger les catégories
        return fetch("http://localhost:8001/api/category")
          .then((res) => res.json())
          .then((data) => {
            setCategories(data);
            setForm({ nom_categorie: "", description: "" });
            setEditingId(null);
          });
      })
      .catch((err) => console.error("Erreur lors de la soumission :", err));
  };

  // Suppression d'une catégorie
  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      fetch(`http://localhost:8001/api/category/delete/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          setCategories(categories.filter((cat) => cat.id_categorie !== id));
        })
        .catch((err) => console.error("Erreur lors de la suppression :", err));
    }
  };

  // Édition d'une catégorie
  const handleEdit = (cat) => {
    setForm({ nom_categorie: cat.nom_categorie, description: cat.description || "" });
    setEditingId(cat.id_categorie);
  };

  return (
    <div>
      <h2>Liste des catégories</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id_categorie}>
              <td>{cat.nom_categorie}</td>
              <td>{cat.description}</td>
              <td>
                <button onClick={() => handleEdit(cat)}>Modifier</button>
                <button onClick={() => handleDelete(cat.id_categorie)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editingId ? "Modifier" : "Ajouter"} une catégorie</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom_categorie"
          placeholder="Nom de la catégorie"
          value={form.nom_categorie}
          onChange={handleChange}
          required
        />
        <br />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <br />
        <button type="submit">{editingId ? "Mettre à jour" : "Ajouter"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ nom_categorie: "", description: "" });
            }}
          >
            Annuler
          </button>
        )}
      </form>
    </div>
  );
};

export default CategoryList;