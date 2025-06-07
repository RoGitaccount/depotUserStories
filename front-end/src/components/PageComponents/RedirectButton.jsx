import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectButton = ({
  to,
  fallback = '/login',         // route alternative si la condition échoue
  condition = true,             // condition par défaut : toujours vraie
  children,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const destination = condition ? to : fallback;
    navigate(destination);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default RedirectButton;
