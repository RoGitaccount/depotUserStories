import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-8 font-sans leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-4">
        Politique de Confidentialité
      </h1>
      <p className="mb-6">
        <strong>Dernière mise à jour :</strong> 23 avril 2025
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données est : <br />
          <strong>John Dohn</strong> <br />
          Contact :{' '}
          <a href="mailto:johnDohn@Hitema.fr" className="text-blue-600 dark:text-blue-400 underline">
            johnDohn@Hitema.fr
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">2. Données collectées</h2>
        <p>
          Lors de l’utilisation du site <strong>Cyna</strong>, nous collectons les données suivantes :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Nom, prénom</li>
          <li>Email, numéro de téléphone</li>
          <li>Mot de passe (stocké de manière sécurisée)</li>
          <li>Adresse, ville, région, code postal, pays</li>
          <li>Historique de navigation (produits consultés, logs)</li>
          <li>Historique de paiements</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">3. Finalités de traitement</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Connexion et gestion de compte utilisateur</li>
          <li>Authentification à deux facteurs (A2F)</li>
          <li>Traitement des paiements et des commandes</li>
          <li>Livraison des produits</li>
          <li>Recommandations personnalisées</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">4. Cookies</h2>
        <p>
          Le site <strong>Cyna</strong> n'utilise actuellement pas de cookies. Des cookies pourraient être utilisés ultérieurement pour :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Analyse de fréquentation</li>
          <li>Gestion de session</li>
          <li>Personnalisation de l’expérience</li>
        </ul>
        <p className="mt-2">
          Un bandeau de consentement sera alors affiché conformément au RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">5. Partage des données</h2>
        <p>
          Les données ne sont pas partagées avec des tiers, sauf si cela est nécessaire pour fournir nos services
          (prestataires de paiement, livraison) ou en cas d’obligation légale.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">6. Hébergement</h2>
        <p>
          Les données sont hébergées en France chez <strong>OVH</strong>, garantissant un haut niveau de sécurité et de conformité au RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">7. Sécurité des données</h2>
        <p>
          Des mesures techniques et organisationnelles sont mises en place pour sécuriser les données contre tout accès non autorisé.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">8. Durée de conservation</h2>
        <p>
          Les données sont conservées le temps nécessaire à la réalisation des finalités pour lesquelles elles sont collectées,
          ou pour répondre à des obligations légales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">9. Droits des utilisateurs</h2>
        <p>Vous disposez des droits suivants :</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Accès, rectification et suppression de vos données</li>
          <li>Limitation ou opposition au traitement</li>
          <li>Portabilité de vos données</li>
        </ul>
        <p className="mt-2">
          Pour exercer vos droits :{' '}
          <a href="mailto:johnDohn@Hitema.fr" className="text-blue-600 dark:text-blue-400 underline">
            johnDohn@Hitema.fr
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">10. Âge minimum</h2>
        <p>
          Le service <strong>Cyna</strong> est destiné aux personnes ayant l’âge légal pour effectuer des paiements en ligne. Il est
          orienté vers un public professionnel (B2B).
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
