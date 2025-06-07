import React, { useState } from 'react';

const PromoCodeForm = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(code);
    } catch (err) {
      console.error(err);
      setError('Code promo invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md transition-colors duration-300"
    >
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Entrez votre code promo"
          disabled={loading}
          className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!code || loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Vérification...' : 'Appliquer'}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </form>
  );
};

export default PromoCodeForm;
