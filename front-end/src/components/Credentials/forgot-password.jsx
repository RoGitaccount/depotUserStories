import React, { useState } from 'react';
import axios from 'axios';
import Footer from '../../components/PageComponents/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8001/api/request-reset', { email });
      setMessage(response.data.message);
      setError('');
      setEmail('');
    } catch (error) {
      setMessage('');
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-indigo-100 dark:border-gray-700 m-2">
          <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">
            Réinitialiser le mot de passe
          </h2>

          {message && (
            <p className="text-green-600 text-sm mb-4 text-center">{message}</p>
          )}
          {error && (
            <p className="text-pink-600 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
            >
              Envoyer le lien de réinitialisation
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
