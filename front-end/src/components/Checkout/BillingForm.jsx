import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import countries from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import CountryListbox from './CountryListbox';


countries.registerLocale(fr);
// récupère la liste officielle des noms de pays en français
const countryList = countries.getNames('fr', { select: 'official' });

const countryOptions = Object.entries(countryList).map(([code, name]) => ({
  code,
  name,
}));

const billingSchema = Yup.object().shape({
  nom: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(100, '100 caractères max')
    .required('Le nom est requis'),

  prenom: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(100, '100 caractères max')
    .required('Le prénom est requis'),

  email: Yup.string()
    .trim()
    .email('Email invalide')
    .max(255, '255 caractères max')
    .required('Email requis'),

  telephone: Yup.string()
    .trim()
    .matches(/^\+?\d{6,15}$/, 'Téléphone invalide')
    .min(6, '6 chiffres minimum')
    .max(15, '15 chiffres max')
    .required('Téléphone requis'),

  adresse: Yup.string()
    .trim()
    .min(5, '5 caractères minimum')
    .max(255, '255 caractères max')
    .required('Adresse requise'),

  complementAdresse: Yup.string()
    .trim()
    .max(100, '100 caractères max'),

  ville: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(100, '100 caractères max')
    .required('Ville requise'),

  region: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(100, '100 caractères max')
    .required('Région requise'),

  codePostal: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(10, '10 caractères max')
    .required('Code postal requis'),

  pays: Yup.string()
    .oneOf(Object.values(countryList), 'Pays invalide')
    .required('Pays requis'),

  nomEntreprise: Yup.string()
    .trim()
    .min(2, '2 caractères minimum')
    .max(255, '255 caractères max')
    .required('Nom entreprise requis'),

  numeroTva: Yup.string()
    .trim()
    .matches(/^[A-Z]{2}[A-Z0-9]{8,12}$/, 'Format TVA invalide')
    .required('Numéro TVA requis'),
});


const defaultValues = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  complementAdresse: '',
  ville: '',
  region: '',
  codePostal: '',
  pays: '',
  nomEntreprise: '',
  numeroTva: '',
};

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

const disabledInputClass =
  'w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-md cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';

const BillingForm = ({ onSubmit, initialValues, disabled }) => {
  return (
    <div className="min-h-screen py-8 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <Formik
        enableReinitialize
        initialValues={initialValues || defaultValues}
        validationSchema={billingSchema}
        onSubmit={(values) => {
          const cleaned = Object.fromEntries(
            Object.entries(values).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val])
          );
          cleaned.telephone = cleaned.telephone.replace(/\s/g, '');
          onSubmit(cleaned);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-black dark:text-white space-y-6">

            <h2 className="text-2xl font-bold">Informations de facturation</h2>

            {/* NOM / PRENOM */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block font-semibold mb-1">Nom</label>
                <Field type="text" name="nom" id="nom" disabled className={disabledInputClass} />
                {errors.nom && touched.nom && <div className="text-red-500 text-sm mt-1">{errors.nom}</div>}
              </div>
              <div>
                <label htmlFor="prenom" className="block font-semibold mb-1">Prénom</label>
                <Field type="text" name="prenom" id="prenom" disabled className={disabledInputClass} />
                {errors.prenom && touched.prenom && <div className="text-red-500 text-sm mt-1">{errors.prenom}</div>}
              </div>
            </div>

            {/* EMAIL / TELEPHONE */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">Email</label>
                <Field type="email" name="email" id="email" disabled className={disabledInputClass} />
                {errors.email && touched.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
              </div>
              <div>
                <label htmlFor="telephone" className="block font-semibold mb-1">Téléphone</label>
                <Field type="tel" name="telephone" id="telephone" maxLength={15} className={inputClass} />
                {errors.telephone && touched.telephone && <div className="text-red-500 text-sm mt-1">{errors.telephone}</div>}
              </div>
            </div>
 
            {/* ADRESSE */}
            <div>
              <label htmlFor="adresse" className="block font-semibold mb-1">Adresse</label>
              <Field type="text" name="adresse" id="adresse" maxLength={255} className={inputClass} />
              {errors.adresse && touched.adresse && <div className="text-red-500 text-sm mt-1">{errors.adresse}</div>}
            </div>

            {/* COMPLEMENT ADRESSE */}
            <div>
              <label htmlFor="complementAdresse" className="block font-semibold mb-1">Complément d'adresse</label>
              <Field type="text" name="complementAdresse" id="complementAdresse" maxLength={100} className={inputClass} />
              {errors.complementAdresse && touched.complementAdresse && (
                <div className="text-red-500 text-sm mt-1">{errors.complementAdresse}</div>
              )}
            </div>

            {/* VILLE / RÉGION / CODE POSTAL */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ville" className="block font-semibold mb-1">Ville</label>
                <Field type="text" name="ville" id="ville" maxLength={100} className={inputClass} />
                {errors.ville && touched.ville && <div className="text-red-500 text-sm mt-1">{errors.ville}</div>}
              </div>
              <div>
                <label htmlFor="region" className="block font-semibold mb-1">Région</label>
                <Field type="text" name="region" id="region" maxLength={100} className={inputClass} />
                {errors.region && touched.region && <div className="text-red-500 text-sm mt-1">{errors.region}</div>}
              </div>
              <div>
                <label htmlFor="codePostal" className="block font-semibold mb-1">Code Postal</label>
                <Field type="text" name="codePostal" id="codePostal" maxLength={10} className={inputClass} />
                {errors.codePostal && touched.codePostal && <div className="text-red-500 text-sm mt-1">{errors.codePostal}</div>}
              </div>
            </div>

            {/* PAYS */}
            <div>
              <label htmlFor="pays" className="block font-semibold mb-1">Pays</label>
              <CountryListbox name="pays" />
              {errors.pays && touched.pays && (
                <div className="text-red-500 text-sm mt-1">{errors.pays}</div>
              )}
            </div>

            {/* ENTREPRISE / TVA */}
            <div>
              <label htmlFor="nomEntreprise" className="block font-semibold mb-1">Nom de l'entreprise</label>
              <Field type="text" name="nomEntreprise" id="nomEntreprise" maxLength={255} className={inputClass} />
              {errors.nomEntreprise && touched.nomEntreprise && <div className="text-red-500 text-sm mt-1">{errors.nomEntreprise}</div>}
            </div>

            <div>
              <label htmlFor="numeroTva" className="block font-semibold mb-1">Numéro de TVA</label>
              <Field type="text" name="numeroTva" id="numeroTva" maxLength={14} className={inputClass} />
              {errors.numeroTva && touched.numeroTva && <div className="text-red-500 text-sm mt-1">{errors.numeroTva}</div>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || disabled}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BillingForm;
