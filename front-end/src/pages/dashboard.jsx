import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const roleLabels = {
    user: "Utilisateur",
    admin: "Administrateur",
    manager: "Gestionnaire"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Vous devez être connecté pour accéder au tableau de bord.");
      return navigate("/login");
    }

    try {
      const decoded = jwtDecode(token);
    
      setUser(decoded);
    } catch (error) {
      console.error("Token invalide :", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return <div className="text-center mt-10">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Bienvenue sur votre tableau de bord</h1>

        <p className="mb-2"><strong>Nom :</strong> {user.nom}</p>
        <p className="mb-2"><strong>Prénom :</strong> {user.prenom}</p>
        <p className="mb-2"><strong>Email :</strong> {user.email}</p>
        <p className="mb-2"><strong>Téléphone :</strong> {user.tel}</p>
        <p className="mb-4"><strong>Rôle :</strong> {roleLabels[user.role] || user.role} </p>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}