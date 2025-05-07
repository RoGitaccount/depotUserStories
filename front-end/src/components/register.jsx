import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios'; // ← Import d'Axios


export default function Inscription() {
  // Définir le schéma de validation Yup
  const validationSchema = Yup.object({
    prenom: Yup.string()
      .required('Le prénom est requis.'),
    nom: Yup.string()
      .required('Le nom est requis.'),
    email: Yup.string()
      .email('Format d\'email invalide.')
      .required('L\'email est requis.'),
    telephone: Yup.string()
      .transform((value) => (value ? value.replace(/\s/g, '') : undefined))
      .matches(/^\d{10,15}$/, "Le numéro de téléphone doit contenir 10 à 15 chiffres")
      .notRequired(),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .required('Le mot de passe est requis.'),
    accepteConditions: Yup.boolean()
      .oneOf([true], 'Vous devez accepter la politique de confidentialité.'),
  });

  const initialValues = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    telephone: '',
    accepteConditions: false,
  };



  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        prenom: values.prenom,
        nom: values.nom,
        email: values.email,
        password: values.password,
        telephone: values.telephone?.replace(/\s/g, '') || undefined,
        role: 'user', // ajouté automatiquement
        };

        // S'assurer de supprimer si vide
        if (!payload.telephone) {
            delete payload.telephone;
        }
        
      const response = await axios.post('http://localhost:8001/api/signup', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Réponse serveur :', response.data);
      alert('Inscription réussie !');
      resetForm();
    } catch (error) {
      console.error('Erreur API :', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="text-2xl font-bold">Logo</div>
        <nav className="space-x-4">
          <a href="#">Link one</a>
          <a href="#">Link two</a>
          <a href="#">Link three</a>
          <a href="#">Link four</a>
        </nav>
        <div className="flex items-center space-x-2">
          <input type="text" className="border px-2 py-1" placeholder="Search" />
          <button>🔍</button>
          <button>☀️</button>
          <button>👤</button>
        </div>
      </header>

      {/* Formulaire principal */}
      <main className="flex-grow flex items-center justify-center">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="w-full max-w-md space-y-4 p-6">
              <h2 className="text-center text-xl font-semibold">Inscription</h2>

              <div>
                <Field name="prenom" placeholder="Prénom" className="border w-full p-2" />
                <ErrorMessage name="prenom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="nom" placeholder="Nom" className="border w-full p-2" />
                <ErrorMessage name="nom" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="email" type="email" placeholder="Email" className="border w-full p-2" />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

                <div>
                    <Field
                        name="telephone"
                        placeholder="Téléphone (facultatif)"
                        className="border w-full p-2"
                    />
                    <ErrorMessage name="telephone" component="div" className="text-red-500 text-sm" />
                </div>

              <div>
                <Field name="password" type="password" placeholder="Mot de passe" className="border w-full p-2" />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <div className="flex items-start">
                <Field type="checkbox" name="accepteConditions" className="mt-1" />
                <label className="ml-2 text-sm">
                  En cochant cette case vous acceptez notre{' '}
                  <a href="#" className="underline">politique de confidentialité</a>.
                </label>
              </div>
              <ErrorMessage name="accepteConditions" component="p" className="text-red-500 text-sm" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {isSubmitting ? 'En cours...' : "S'inscrire"}
              </button>
            </Form>
          )}
        </Formik>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center p-4 border-t space-y-2">
        <div className="text-2xl font-bold">Logo</div>
        <nav className="space-x-4">
          <a href="#">Link one</a>
          <a href="#">Link two</a>
          <a href="#">Link three</a>
          <a href="#">Link four</a>
        </nav>
        <div className="flex space-x-4 mt-2">
          <a href="#">📸</a>
          <a href="#">📘</a>
          <a href="#">🐦</a>
        </div>
        <p className="text-xs mt-2">
          © 2024 Your Website. All rights reserved. | <a href="#" className="underline">Privacy Policy</a> | <a href="#" className="underline">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}
