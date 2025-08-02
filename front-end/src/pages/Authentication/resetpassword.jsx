import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Footer from '../../components/PageComponents/Footer';
import axiosInstance from '../../services/axiosInstance';

const ResetPassword = () => {
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .max(255, 'Le mot de passe ne doit pas dépasser 255 caractères.')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
        'Le mot de passe doit contenir au minimum une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
      .required('Le nouveau mot de passe est requis.'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe ne correspondent pas.')
      .required('La confirmation est requise.')
  });


  const initialValues = {
    newPassword: '',
    confirmPassword: ''
  };

  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      await axiosInstance.post('/reset-password', {
        token,
        newPassword: values.newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setErrors({ confirmPassword: 'Erreur lors de la réinitialisation du mot de passe.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-indigo-100 dark:border-gray-700 m-2">
          <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">
            Réinitialiser votre mot de passe
          </h2>

          {success && (
            <p className="text-green-600 text-sm mb-4 text-center">
              Mot de passe réinitialisé avec succès ! Redirection en cours...
            </p>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <Field
                    type="password"
                    name="newPassword"
                    placeholder="Nouveau mot de passe"
                    maxLength={255}
                    className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <ErrorMessage name="newPassword" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <div>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    maxLength={255}
                    className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="text-pink-600 text-sm mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
                >
                  {isSubmitting ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
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
};



export default ResetPassword;
