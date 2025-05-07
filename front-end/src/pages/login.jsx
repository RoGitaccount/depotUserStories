import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios'; // ← Import d'Axios
import { useNavigate } from 'react-router-dom';  // Pour rediriger après la connexion réussie

export default function Login() {
  const navigate = useNavigate();  // Pour la redirection après connexion

  // Définir le schéma de validation Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Format d\'email invalide.')
      .required('L\'email est requis.'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .required('Le mot de passe est requis.'),
  });

  const initialValues = {
    email: '',
    password: '',
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        email: values.email,
        password: values.password,
      };
  
      const response = await axios.post('http://localhost:8001/api/login', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Réponse serveur :', response.data);
      alert('Code envoyé par email. Veuillez vérifier votre boîte mail.');
  
      // Stocke l'email dans le localStorage pour le récupérer sur la page /verify-code
      localStorage.setItem('emailToVerify', values.email);
  
      // Redirige vers la page de saisie du code
      navigate('/verify-code');
    } catch (error) {
      console.error('Erreur API :', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Erreur lors de la connexion.');
    } finally {
      setSubmitting(false);
    }
  };
  ``
  

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
              <h2 className="text-center text-xl font-semibold">Connexion</h2>

              <div>
                <Field name="email" type="email" placeholder="Email" className="border w-full p-2" />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="password" type="password" placeholder="Mot de passe" className="border w-full p-2" />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {isSubmitting ? 'En cours...' : "Se connecter"}
              </button>

              {/* Lien mot de passe oublié */}
              <div className="text-center mt-4">
                <a href="/forgot-password" className="text-blue-500 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
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
