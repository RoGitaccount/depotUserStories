import React from 'react';
import { View, Text, TextInput, ScrollView, Button } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc', // clair
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#18181b', // sombre
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111827',
  },
  darkLabel: {
    color: '#f3f4f6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    color: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  darkInput: {
    backgroundColor: '#27272a',
    color: '#f3f4f6',
    borderColor: '#52525b',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

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

const InputField = ({
  label,
  field,
  handleChange,
  handleBlur,
  values,
  errors,
  touched,
  editable = true,
}) => {
  // Pour le dark mode, tu peux utiliser un hook ou une prop, ici exemple simple :
  const isDark = false; // Remplace par ton système de thème si besoin

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[styles.label, isDark && styles.darkLabel]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isDark && styles.darkInput,
          !editable && { backgroundColor: isDark ? '#3f3f46' : '#e5e7eb' },
        ]}
        onChangeText={handleChange(field)}
        onBlur={handleBlur(field)}
        value={values?.[field] ?? ''}
        editable={editable}
        placeholder={label}
        placeholderTextColor={isDark ? '#a1a1aa' : '#9ca3af'}
      />
      {errors[field] && touched[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );
};

const BillingForm = ({ onSubmit, initialValues = defaultValues, disabled = false }) => {
  const isDark = false; // Remplace par ton système de thème si besoin

  return (
    <ScrollView
      style={[styles.container, isDark && styles.darkContainer]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
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
            <Text style={[{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: isDark ? '#f3f4f6' : '#111827' }]}>
              Informations de facturation
            </Text>

            {/* Champs comme avant */}
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

            <View style={styles.button}>
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
};

export default BillingForm;
