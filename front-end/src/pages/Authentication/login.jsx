import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "../../components/PageComponents/Footer";
import axiosInstance from '../../services/axiosInstance';
import { toast, Bounce } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Format d\'email invalide.')
      .max(255, "L'email ne doit pas dépasser 255 caractères.")
      .required('L\'email est requis.'),
    password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .max(255).required('Le mot de passe est requis.'),
  });

  const initialValues = { email: '', password: '', rememberMe: false };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe, // on l'envoie au backend
    };
    await axiosInstance.post('/login', payload);

      
      toast.success('Code envoyé par email. Veuillez vérifier votre boîte mail.',{
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

      // Transmet l'email vers la page de vérification
      navigate('/verify-code', { state: { email: values.email,rememberMe: values.rememberMe,} });

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la connexion.',
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-indigo-100 dark:border-gray-700 m-2">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">Connexion à votre compte</h2>
                <div>
                  <Field name="email" type="email" maxLength={255} placeholder="Email" className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <ErrorMessage name="email" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <div>
                  <Field name="password" type="password" maxLength={255} placeholder="Mot de passe" className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <ErrorMessage name="password" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition">
                  {isSubmitting ? 'En cours...' : "Se connecter"}
                </button>
                <div className="flex items-center">
                <Field
                  type="checkbox"
                  name="rememberMe"
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700 dark:text-gray-200">
                  Rester connecté
                </label>
              </div>
                <div className="text-center mt-2">
                  <a href="/forgot-password" className="text-indigo-500 hover:underline text-sm">
                    Mot de passe oublié ?
                  </a>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
}
