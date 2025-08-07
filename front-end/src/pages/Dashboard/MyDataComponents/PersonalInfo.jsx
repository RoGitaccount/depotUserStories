import React from "react";
import { Mail, SquarePen, User } from 'lucide-react';

const PersonalInfo = ({
  user,
  onEditEmail,
  onEditInfo,
  onExportPDF
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center mb-6">
      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Informations personnelles
      </h2>
    </div>
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Nom :</span>
        <span className="text-gray-900 dark:text-white font-medium">{user.nom}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Prénom :</span>
        <span className="text-gray-900 dark:text-white font-medium">{user.prenom}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center py-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Email :</span>
        <span className="text-gray-900 dark:text-white font-medium break-all">{user.email}</span>
      </div>
    </div>
    <div className="mt-8 space-y-3">
      <button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        onClick={onEditEmail}
      >
        <Mail className="w-5 h-5" />
        <span>Modifier mon email</span>
      </button>
      <button 
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        onClick={onEditInfo}
      >
        <SquarePen className="w-5 h-5" />
        <span>Modifier mes informations</span>
      </button>
      <button 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        onClick={onExportPDF}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Exporter mes données (PDF)</span>
      </button>
    </div>
  </div>
);

export default PersonalInfo;