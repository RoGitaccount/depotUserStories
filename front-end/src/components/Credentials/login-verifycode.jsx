import React, { useEffect, useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Footer from "../PageComponents/Footer";
import axiosInstance from "../../services/axiosInstance";
import { toast,Bounce } from "react-toastify";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");

 useEffect(() => {
  const emailFromState = location.state?.email;
  const rememberMeFromState = location.state?.rememberMe ?? false;

  if (emailFromState) {
    setEmail(emailFromState);
    setInitialRememberMe(rememberMeFromState);
  } else {
    navigate("/login");
  }
}, [location.state, navigate]);

const [initialRememberMe, setInitialRememberMe] = useState(false);

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Format invalide")
    .max(255, "L'email ne doit pas dépasser 255 caractères.")
    .required("L'email est requis."),
  code: Yup.string()
    .length(6, "Le code doit contenir exactement 6 caractères.")
    .required("Le code est requis."),
  rememberMe: Yup.boolean()
});

const initialValues = {
  email: email || "",
  code: "",
  rememberMe: initialRememberMe
};


  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axiosInstance.post("/verify", values);

      login();
       toast.success('Connexion réussie !',{
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      navigate("/dashboard");

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de vérification.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
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
              <div className="w-full border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 bg-gray-100 dark:bg-gray-700/70">
                {email}
              </div>
              <div>
                <Field
                  name="code"
                  type="text"
                  maxLength={6}
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

              <div className="text-center mt-2">
                <a href="/login" className="text-indigo-500 hover:underline text-sm">
                  Retour à la page de Connexion
                </a>
              </div>
            
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
