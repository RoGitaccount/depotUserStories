import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../services/axiosInstance";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "user",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer tous les utilisateurs
  const fetchUsers = () => {
    axiosInstance
      .get("/user")
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch((err) => console.error("Erreur récupération utilisateurs :", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Gérer la modification du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Soumettre la mise à jour utilisateur
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingId) {
      alert("Sélectionnez un utilisateur à modifier.");
      return;
    }

    axiosInstance
        .put(`/user/update/${editingId}`, {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          role: form.role,
        })
        .then(() => {
          fetchUsers();
          setForm({ nom: "", prenom: "", email: "", role: "user" });
          setEditingId(null);
        })
        .catch((err) => console.error("Erreur mise à jour utilisateur :", err));
    };

  // Supprimer un utilisateur
  const handleDelete = (id) => {
  if (window.confirm("Supprimer cet utilisateur ?")) {
    axiosInstance
      .delete(`/user/delete/${id}`)
      .then(() => {
        fetchUsers();
        if (editingId === id) {
          setForm({ nom: "", prenom: "", email: "", role: "user" });
          setEditingId(null);
        }
      })
      .catch((err) => console.error("Erreur suppression utilisateur :", err));
    }
  };

  // Préparer la modification d’un utilisateur (pré-remplir formulaire)
  const handleEdit = (user) => {
    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setEditingId(user.id_user);
  };

  // Filtrer et trier utilisateurs par nom/prénom
  const filteredUsers = users
    .filter((u) => {
      const fullName = `${u.prenom || ""} ${u.nom || ""}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const nameA = `${a.prenom || ""} ${a.nom || ""}`.toLowerCase();
      const nameB = `${b.prenom || ""} ${b.nom || ""}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  function highlightText(text, highlight) {
    if (!highlight) return text;
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
    <div className="text-black dark:text-white min-h-screen bg-gradient-to-b from-green-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Formulaire */}
        <div className="md:w-1/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Modifier un utilisateur" : "Sélectionnez un utilisateur"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="prenom"
              placeholder="Prénom"
              value={form.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            <input
              name="nom"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
            <button
              type="submit"
              className={`px-6 py-2 ${
                editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              } text-white rounded-md`}
              disabled={!editingId}
            >
              Mettre à jour
            </button>
          </form>
        </div>

        {/* Liste des utilisateurs */}
        <div className="md:w-2/3 w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[580px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Liste des utilisateurs</h3>
            <input
              placeholder="Rechercher utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <table className="min-w-full table-auto border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Rôle</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
              {currentUsers.map((user) => (
                <tr
                  key={user.id_user}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2 border">
                    {highlightText(user.prenom || "", searchTerm)}
                  </td>
                  <td className="px-4 py-2 border">
                    {highlightText(user.nom || "", searchTerm)}
                  </td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border capitalize">{user.role}</td>
                  <td className="border px-4 py-2 text-center space-x-2 border-gray-400 dark:border-gray-500">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Modifier
                    </button>
                     <button
                  onClick={() => handleDelete(user.id_user)}
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
      </div>
    </div>
  );
};

export default UserList;