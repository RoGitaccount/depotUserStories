// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const queryParams = new URLSearchParams(location.search);
//   const token = queryParams.get('token');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       setError('Les mots de passe ne correspondent pas.');
//       return;
//     }

//     try {
//       await axios.post(
//         'http://localhost:8001/api/reset-password',
//         { token, newPassword },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       setSuccess(true);
//       setError('');
//       setTimeout(() => navigate('/login'), 3000);
//     } catch {
//       setError('Erreur lors de la réinitialisation du mot de passe.');
//     }
//   };

//   return (
//     <div>
//       <h2>Réinitialiser votre mot de passe</h2>
//       {error && <p className="error">{error}</p>}
//       {success && <p className="success">Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.</p>}
      
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Nouveau mot de passe</label>
//           <input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Confirmer le mot de passe</label>
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Réinitialiser le mot de passe</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;



import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/PageComponents/Footer';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8001/api/reset-password',
        { token, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Erreur lors de la réinitialisation du mot de passe.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <main className="flex-grow flex items-center justify-center px-2">
        <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-indigo-100 dark:border-gray-700 m-2">
          <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6">
            Réinitialiser votre mot de passe
          </h2>

          {error && <p className="text-pink-600 text-sm mb-4 text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm mb-4 text-center">
              Mot de passe réinitialisé avec succès ! Redirection en cours...
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
            >
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
