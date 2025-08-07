import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosInstance';
import Footer from "../../components/PageComponents/Footer";

export default function Inscription() {
  const validationSchema = Yup.object({
    prenom: Yup.string().max(100, "Le prénom saisie est trop long.").required('Le prénom est requis.'),
    nom: Yup.string().max(100, "Le nom saisie est trop long.").required('Le nom est requis.'),
    email: Yup.string()
      .email('Format d\'email invalide.')
      .max(255, "L'email ne doit pas dépasser 255 caractères.")
      .required('L\'email est requis.'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .max(255, 'Le mot de passe ne doit pas dépasser 255 caractères.')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
      .required('Le mot de passe est requis.'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas.')
      .required('Veuillez confirmer votre mot de passe.'),
    accepteConditions: Yup.boolean()
      .oneOf([true], 'Vous devez accepter la politique de confidentialité.')
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const initialValues = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      await axiosInstance.post('/signup', payload);
      setSuccessMessage('Inscription réussie ! 🎉');
      setErrorMessage('');
      resetForm();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'inscription.');
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
                <Field name="prenom" placeholder="Prénom" maxLength={100} className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="prenom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="nom" placeholder="Nom" maxLength={100} className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="nom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="email" type="email" maxLength={255} placeholder="Email" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="password" type="password" maxLength={255} placeholder="Mot de passe" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="confirmPassword" type="password" maxLength={255} placeholder="Confirmer le mot de passe" className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm" />
              </div>

              <div className="flex items-start space-x-2">
                <Field type="checkbox" name="accepteConditions" className="mt-1" />
                <label className="text-sm dark:text-gray-200">
                  En cochant cette case vous acceptez notre{' '}
                  <a href="./confidentialite" className="underline text-blue-600 dark:text-blue-300">politique de confidentialité</a>.
                </label>
              </div>
              <ErrorMessage name="accepteConditions" component="p" className="text-red-500 text-sm" />

              {successMessage && (
                <div className="text-green-600 bg-green-100 border border-green-300 p-2 rounded text-sm text-center">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="text-red-600 bg-red-100 border border-red-300 p-2 rounded text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
              >
                {isSubmitting ? 'En cours...' : "S'inscrire"}
              </button>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}
