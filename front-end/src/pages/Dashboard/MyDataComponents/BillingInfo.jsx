import React from "react";
import { FileText, SquarePen } from 'lucide-react';

const BillingInfo = ({
  billing,
  onEditBilling
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center mb-6">
      <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Informations de facturation
      </h2>
    </div>
    {billing ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom entreprise</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.nom_entreprise}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Numéro TVA</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.numero_tva}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</label>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-900 dark:text-white font-medium">{billing.adresse_ligne1}</p>
                    {billing.adresse_ligne2 && (
                      <p className="text-gray-900 dark:text-white font-medium">{billing.adresse_ligne2}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ville</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.ville}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code postal</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.code_postal}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Région</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.region}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pays</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.pays}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.telephone}</p>
                </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Aucune information de facturation ajoutée
        </p>
      </div>
    )}
    <div className="mt-8">
      <button 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        onClick={onEditBilling}
      >
        <SquarePen className="w-5 h-5" />
        <span>
          {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
        </span>
      </button>
    </div>
  </div>
);

export default BillingInfo;