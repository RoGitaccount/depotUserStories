import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "../../components/PageComponents/Footer";

export default function Login() {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Format d\'email invalide.').required('L\'email est requis.'),
    password: Yup.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').required('Le mot de passe est requis.'),
  });

  const initialValues = { email: '', password: '' };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { email: values.email, password: values.password };
      await axios.post('http://localhost:8001/api/login', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Code envoyé par email. Veuillez vérifier votre boîte mail.');
      localStorage.setItem('emailToVerify', values.email);
      navigate('/verify-code');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la connexion.');
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
                  <Field name="email" type="email" placeholder="Email" className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <ErrorMessage name="email" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <div>
                  <Field name="password" type="password" placeholder="Mot de passe" className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <ErrorMessage name="password" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition">
                  {isSubmitting ? 'En cours...' : "Se connecter"}
                </button>
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
      <Footer/>
    </div>
  );
}