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
    <form onSubmit={handleSubmit} className="promo-form">
      <h3>Code Promo</h3>
      <div className="form-group">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Entrez votre code promo"
          disabled={loading}
        />
        <button type="submit" disabled={!code || loading}>
          {loading ? 'Vérification...' : 'Appliquer'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default PromoCodeForm;