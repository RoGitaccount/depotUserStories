import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Footer from '../../components/PageComponents/Footer';

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Format d'email invalide.")
      .max(255, "L'email ne doit pas dépasser 255 caractères.")
      .required("L'email est requis."),
  });

  const initialValues = { email: '' };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post('http://localhost:8001/api/request-reset', { email: values.email });
      setMessage(response.data.message);
      setError('');
      resetForm();
    } catch (error) {
      setMessage('');
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-indigo-100 dark:border-gray-700 m-2">
          <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">
            Réinitialiser le mot de passe
          </h2>

          {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
          {error && <p className="text-pink-600 text-sm mb-4 text-center">{error}</p>}

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Votre email"
                    className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    maxLength={255}
                  />
                  <ErrorMessage name="email" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
      </main>
    </div>
  );
}
