import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
// import './BillingForm.css';

const billingSchema = Yup.object().shape({
  nom: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('Le nom est requis'),
  prenom: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('Le prénom est requis'),
  email: Yup.string()
    .transform(value => value ? value.trim() : '')
    .email('Email invalide')
    .required('L\'email est requis'),
  telephone: Yup.string()
    .transform(value => value ? value.replace(/\s/g, '') : undefined)
    .matches(/^[\d\s()+-]{7,20}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  adresse: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('L\'adresse est requise'),
  complementAdresse: Yup.string()
    .transform(value => value ? value.trim() : ''),
  ville: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('La ville est requise'),
  region: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('La région est requise'),
  codePostal: Yup.string()
    .transform(value => value ? value.trim() : '')
    .matches(/^\d{4,10}$/, 'Le code postal doit contenir entre 4 et 10 chiffres')
    .required('Le code postal est requis'),
  pays: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('Le pays est requis'),
  nomEntreprise: Yup.string()
    .transform(value => value ? value.trim() : '')
    .required('Le nom de l\'entreprise est requis'),
  numeroTva: Yup.string()
    .transform(value => value ? value.trim() : '')
    .matches(/^[A-Z0-9]+$/, 'Le numéro de TVA doit contenir uniquement des lettres et des chiffres')
    .required('Le numéro de TVA est requis'),
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
          <Form className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-black dark:text-white">
            <h2 className="text-2xl font-bold mb-6">Informations de facturation</h2>

            {/* NOM / PRENOM */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block font-semibold mb-1">Nom</label>
                <Field
                  type="text"
                  name="nom"
                  id="nom"
                  disabled
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                />
                {errors.nom && touched.nom && <div className="text-red-500 text-sm">{errors.nom}</div>}
              </div>

              <div>
                <label htmlFor="prenom" className="block font-semibold mb-1">Prénom</label>
                <Field
                  type="text"
                  name="prenom"
                  id="prenom"
                  disabled
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                />
                {errors.prenom && touched.prenom && <div className="text-red-500 text-sm">{errors.prenom}</div>}
              </div>
            </div>

            {/* EMAIL / TÉLÉPHONE */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  disabled
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                />
                {errors.email && touched.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="telephone" className="block font-semibold mb-1">Téléphone</label>
                <Field
                  type="tel"
                  name="telephone"
                  id="telephone"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                {errors.telephone && touched.telephone && <div className="text-red-500 text-sm">{errors.telephone}</div>}
              </div>
            </div>

            {/* ADRESSE */}
            <div className="mt-4">
              <label htmlFor="adresse" className="block font-semibold mb-1">Adresse</label>
              <Field
                type="text"
                name="adresse"
                id="adresse"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              {errors.adresse && touched.adresse && <div className="text-red-500 text-sm">{errors.adresse}</div>}
            </div>

            {/* COMPLÉMENT */}
            <div className="mt-4">
              <label htmlFor="complementAdresse" className="block font-semibold mb-1">Complément d'adresse</label>
              <Field
                type="text"
                name="complementAdresse"
                id="complementAdresse"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>

            {/* VILLE / RÉGION / CODE POSTAL */}
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="ville" className="block font-semibold mb-1">Ville</label>
                <Field
                  type="text"
                  name="ville"
                  id="ville"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                {errors.ville && touched.ville && <div className="text-red-500 text-sm">{errors.ville}</div>}
              </div>

              <div>
                <label htmlFor="region" className="block font-semibold mb-1">Région</label>
                <Field
                  type="text"
                  name="region"
                  id="region"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                {errors.region && touched.region && <div className="text-red-500 text-sm">{errors.region}</div>}
              </div>

              <div>
                <label htmlFor="codePostal" className="block font-semibold mb-1">Code Postal</label>
                <Field
                  type="text"
                  name="codePostal"
                  id="codePostal"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                {errors.codePostal && touched.codePostal && <div className="text-red-500 text-sm">{errors.codePostal}</div>}
              </div>
            </div>

            {/* PAYS */}
            <div className="mt-4">
              <label htmlFor="pays" className="block font-semibold mb-1">Pays</label>
              <Field
                type="text"
                name="pays"
                id="pays"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              {errors.pays && touched.pays && <div className="text-red-500 text-sm">{errors.pays}</div>}
            </div>

            {/* ENTREPRISE / TVA */}
            <div className="mt-4">
              <label htmlFor="nomEntreprise" className="block font-semibold mb-1">Nom de l'entreprise</label>
              <Field
                type="text"
                name="nomEntreprise"
                id="nomEntreprise"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              {errors.nomEntreprise && touched.nomEntreprise && <div className="text-red-500 text-sm">{errors.nomEntreprise}</div>}
            </div>

            <div className="mt-4">
              <label htmlFor="numeroTva" className="block font-semibold mb-1">Numéro de TVA</label>
              <Field
                type="text"
                name="numeroTva"
                id="numeroTva"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              {errors.numeroTva && touched.numeroTva && <div className="text-red-500 text-sm">{errors.numeroTva}</div>}
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