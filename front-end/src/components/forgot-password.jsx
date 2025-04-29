import React, { useState } from 'react';
import axios from 'axios'; // Pour l'appel API

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8001/api/request-reset', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-md space-y-4 p-6">
        <h2 className="text-center text-xl font-semibold">Réinitialiser le mot de passe</h2>

        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border w-full p-2"
              required
            />
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
            Envoyer le lien de réinitialisation
          </button>
        </form>
      </div>
    </div>
  );
}
