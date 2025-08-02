import React from 'react';

const TextareaWithLimit = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  maxLength = 200,
}) => {
  return (
    <div className="relative w-full">
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder || `Votre message (max ${maxLength} caractères)`}
        
        // Style fixe imposé
        className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
      />
      <div className="absolute bottom-2 right-4 text-sm text-gray-500 dark:text-gray-300">
        {value.length} / {maxLength}
      </div>
    </div>
  );
};

export default TextareaWithLimit;
