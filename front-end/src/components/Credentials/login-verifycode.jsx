import React, { useEffect, useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Footer from "../PageComponents/Footer";

export default function VerifyCode() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  useEffect(() => {
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
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }

      login(token);

      alert("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur de vérification.");
    } finally {
      setSubmitting(false);
    }
  };

 return (
  <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
    
    {/* Contenu principal centré */}
    <div className="flex-grow flex items-center justify-center">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-indigo-100 dark:border-gray-700 m-2 space-y-6">
            <h2 className="text-center font-semibold text-xl text-indigo-700 dark:text-indigo-200">
              Vérification du code
            </h2>

            <div>
              <Field
                name="email"
                type="email"
                placeholder="Votre email"
                className="w-full border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <ErrorMessage name="email" component="p" className="text-pink-600 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="code"
                type="text"
                placeholder="Code de vérification"
                className="w-full border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <ErrorMessage name="code" component="p" className="text-pink-600 text-sm mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
            >
              {isSubmitting ? "Vérification..." : "Vérifier"}
            </button>
          </Form>
        )}
      </Formik>
    </div>

    <Footer/>
  </div>
);
}