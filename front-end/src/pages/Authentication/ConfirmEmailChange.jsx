// src/pages/Authentication/ConfirmEmailChange.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        toast.error("Lien invalide.");
        navigate("/");
        return;
      }

      try {
        const res = await axiosInstance.post("/rgpd/confirm-email-change", { token });
        toast.info("Votre email a été modifié. Veuillez vous reconnecter.");
        
        // Déconnexion propre
        await axiosInstance.post("/token/logout");
        
        navigate("/login");
      } catch (err) {
        toast.error(err.response?.data?.message || "Lien invalide ou expiré.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{loading ? "Validation de l'email..." : "Redirection en cours..."}</h2>
    </div>
  );
};

export default ConfirmEmailChange;
