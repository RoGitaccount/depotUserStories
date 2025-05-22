import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import './BillingForm.css';

const billingSchema = Yup.object().shape({
  nom: Yup.string().required('Le nom est requis'),
  prenom: Yup.string().required('Le prénom est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  telephone: Yup.string().required('Le téléphone est requis'),
  adresse: Yup.string().required('L\'adresse est requise'),
  ville: Yup.string().required('La ville est requise'),
  region: Yup.string().required('La région est requise'),
  codePostal: Yup.string().required('Le code postal est requis'),
  pays: Yup.string().required('Le pays est requis'),
  nomEntreprise: Yup.string().required('Le nom de l\'entreprise est requis'),
  numeroTva: Yup.string().required('Le numéro de TVA est requis')
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
  numeroTva: ''
};

const BillingForm = ({ onSubmit, initialValues, disabled }) => {
  console.log('Valeurs initiales reçues:', initialValues);

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues || defaultValues}
      validationSchema={billingSchema}
      onSubmit={onSubmit}
    >
      {/* {({ values, errors, touched, isSubmitting }) => ( */}
      {({ errors, touched, isSubmitting }) => (
        <Form className="billing-form">
          <h2>Informations de facturation</h2>
          
          {/* <div className="debug-info">
            <p>Valeurs actuelles :</p>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </div> */}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <Field type="text" name="nom" id="nom" disabled />
              {errors.nom && touched.nom && <div className="error">{errors.nom}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <Field type="text" name="prenom" id="prenom" disabled />
              {errors.prenom && touched.prenom && <div className="error">{errors.prenom}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field type="email" name="email" id="email" disabled />
              {errors.email && touched.email && <div className="error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <Field type="tel" name="telephone" id="telephone" />
              {errors.telephone && touched.telephone && <div className="error">{errors.telephone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <Field type="text" name="adresse" id="adresse" />
            {errors.adresse && touched.adresse && <div className="error">{errors.adresse}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="complementAdresse">Complément d'adresse</label>
            <Field type="text" name="complementAdresse" id="complementAdresse" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ville">Ville</label>
              <Field type="text" name="ville" id="ville" />
              {errors.ville && touched.ville && <div className="error">{errors.ville}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="region">Région</label>
              <Field type="text" name="region" id="region" />
              {errors.region && touched.region && (<div className="error">{errors.region}</div>)}
            </div>

            <div className="form-group">
              <label htmlFor="codePostal">Code Postal</label>
              <Field type="text" name="codePostal" id="codePostal" />
              {errors.codePostal && touched.codePostal && <div className="error">{errors.codePostal}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pays">Pays</label>
            <Field type="text" name="pays" id="pays" />
            {errors.pays && touched.pays && <div className="error">{errors.pays}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="nomEntreprise">Nom de l'entreprise</label>
            <Field type="text" name="nomEntreprise" id="nomEntreprise" />
            {errors.nomEntreprise && touched.nomEntreprise && <div className="error">{errors.nomEntreprise}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="numeroTva">Numéro de TVA</label>
            <Field type="text" name="numeroTva" id="numeroTva" />
            {errors.numeroTva && touched.numeroTva && <div className="error">{errors.numeroTva}</div>}
          </div>

          <button type="submit" disabled={isSubmitting || disabled}>Valider</button>        </Form>
      )}
    </Formik>
  );
};

export default BillingForm;