import React, { useEffect, useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // Importer AuthContext

export default function VerifyCode() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Accéder à la fonction login depuis AuthContext
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Récupère l’email depuis le localStorage
    const savedEmail = localStorage.getItem("emailToVerify");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email().required(),
    code: Yup.string().required("Le code est requis."),
  });

  const initialValues = {
    email: email || "",
    code: "",
  };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post("http://localhost:8001/api/verify", values);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(user, token);

      alert("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur de vérification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Formik
        enableReinitialize
        initialValues={initialValues} // ✅ utilisation correcte de la variable
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-sm space-y-4 p-4">
            <h2 className="text-center font-semibold text-xl">Vérification du code</h2>

            <div>
              <Field name="email" type="email" placeholder="Votre email" className="w-full border p-2" />
              <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <Field name="code" type="text" placeholder="Code de vérification" className="w-full border p-2" />
              <ErrorMessage name="code" component="p" className="text-red-500 text-sm" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              {isSubmitting ? "Vérification..." : "Vérifier"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
