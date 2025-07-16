// src/pages/Authentication/ConfirmEmailChange.jsx



import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      axios
        .post("http://localhost:8001/api/rgpd/confirm-email-change", { token })
        .then((res) => {
          toast.success(res.data.message || "Email confirmé.");
          localStorage.removeItem("token");
          navigate("/login");
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Lien invalide ou expiré.");
          navigate("/");
        })
        .finally(() => setLoading(false));
    } else {
      toast.error("Lien invalide.");
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{loading ? "Validation de l'email..." : "Redirection en cours..."}</h2>
    </div>
  );
};

export default ConfirmEmailChange;

