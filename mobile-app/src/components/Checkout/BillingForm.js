import React from 'react';
import { ScrollView, Text, TextInput, View, Button } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

const billingSchema = Yup.object().shape({
  nom: Yup.string().trim().required('Le nom est requis'),
  prenom: Yup.string().trim().required('Le prénom est requis'),
  email: Yup.string().trim().email('Email invalide').required('L\'email est requis'),
  telephone: Yup.string()
    .transform(value => value ? value.replace(/\s/g, '') : '')
    .matches(/^[\d\s()+-]{7,20}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  adresse: Yup.string().trim().required('L\'adresse est requise'),
  complementAdresse: Yup.string().trim(),
  ville: Yup.string().trim().required('La ville est requise'),
  region: Yup.string().trim().required('La région est requise'),
  codePostal: Yup.string()
    .trim()
    .matches(/^\d{4,10}$/, 'Le code postal doit contenir entre 4 et 10 chiffres')
    .required('Le code postal est requis'),
  pays: Yup.string().trim().required('Le pays est requis'),
  nomEntreprise: Yup.string().trim().required('Le nom de l\'entreprise est requis'),
  numeroTva: Yup.string()
    .trim()
    .matches(/^[A-Z0-9]+$/, 'Le numéro de TVA doit contenir uniquement des lettres et des chiffres')
    .required('Le numéro de TVA est requis'),
});

const defaultValues = {
  nom: '', prenom: '', email: '', telephone: '', adresse: '',
  complementAdresse: '', ville: '', region: '', codePostal: '',
  pays: '', nomEntreprise: '', numeroTva: '',
};

const InputField = ({ label, field, handleChange, handleBlur, values, errors, touched, editable = true }) => (
  <View className="mb-4">
    <Text className="text-gray-900 dark:text-gray-100 font-semibold mb-1 text-base">{label}</Text>
    <TextInput
      className={`border rounded-xl px-4 py-2 text-base 
        ${editable ? 'bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100' : 
        'bg-gray-200 dark:bg-gray-700'}`}
      onChangeText={handleChange(field)}
      onBlur={handleBlur(field)}
      value={values?.[field] ?? ''}
      editable={editable}
      placeholder={label}
      placeholderTextColor="#9ca3af"
    />
    {errors[field] && touched[field] && (
      <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>
    )}
  </View>
);

const BillingForm = ({ onSubmit, initialValues = defaultValues, disabled = false }) => (
  <ScrollView className="flex-1 p-5 bg-gray-100 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={billingSchema}
      onSubmit={(values) => {
        const cleaned = Object.fromEntries(
          Object.entries(values).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val])
        );
        cleaned.telephone = cleaned.telephone.replace(/\s/g, '');
        onSubmit(cleaned);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View>
          <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Informations de facturation
          </Text>

          <InputField label="Nom" field="nom" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} editable={false} />
          <InputField label="Prénom" field="prenom" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} editable={false} />
          <InputField label="Email" field="email" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} editable={false} />
          <InputField label="Téléphone" field="telephone" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Adresse" field="adresse" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Complément d'adresse" field="complementAdresse" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Ville" field="ville" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Région" field="region" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Code Postal" field="codePostal" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Pays" field="pays" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Nom de l'entreprise" field="nomEntreprise" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />
          <InputField label="Numéro de TVA" field="numeroTva" handleChange={handleChange} handleBlur={handleBlur} values={values} errors={errors} touched={touched} />

          <View className="mt-6 rounded-xl overflow-hidden">
            <Button
              onPress={handleSubmit}
              title="Valider"
              color="#2563eb"
              disabled={isSubmitting || disabled}
            />
          </View>
        </View>
      )}
    </Formik>
  </ScrollView>
);

export default BillingForm;
