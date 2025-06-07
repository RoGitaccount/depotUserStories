import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Footer from "../../components/PageComponents/Footer";

export default function Inscription() {
  const validationSchema = Yup.object({
    prenom: Yup.string().required('Le prénom est requis.'),
    nom: Yup.string().required('Le nom est requis.'),
    email: Yup.string().email('Format d\'email invalide.').required('L\'email est requis.'),
    password: Yup.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').required('Le mot de passe est requis.'),
    accepteConditions: Yup.boolean().oneOf([true], 'Vous devez accepter la politique de confidentialité.'),
  });

  const initialValues = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    accepteConditions: false,
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        prenom: values.prenom,
        nom: values.nom,
        email: values.email,
        password: values.password,
        role: 'user',
      };
      await axios.post('http://localhost:8001/api/signup', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert('Inscription réussie !');
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100 dark:border-gray-700 m-2 space-y-6">
              <h2 className="text-center text-2xl font-bold text-blue-600 dark:text-blue-200">Inscription</h2>

              <div>
                <Field name="prenom" placeholder="Prénom" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="prenom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="nom" placeholder="Nom" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="nom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="email" type="email" placeholder="Email" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="password" type="password" placeholder="Mot de passe" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <div className="flex items-start space-x-2">
                <Field type="checkbox" name="accepteConditions" className="mt-1" />
                <label className="text-sm dark:text-gray-200">
                  En cochant cette case vous acceptez notre{' '}
                  <a href="#" className="underline text-blue-600 dark:text-blue-300">politique de confidentialité</a>.
                </label>
              </div>
              <ErrorMessage name="accepteConditions" component="p" className="text-red-500 text-sm" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition">              
                {isSubmitting ? 'En cours...' : "S'inscrire"}
              </button>
            </Form>
          )}
        </Formik>
      </main>

      <Footer/> 
    </div>
  );
}