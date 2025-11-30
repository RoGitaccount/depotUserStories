import React, { useEffect, useState } from "react";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);
    useEffect(() => {
      axiosInstance.get("/offers")
        .then((res) => setOffers(res.data))
        .catch((err) => {
          setError(err.response?.data?.message || err.message || "Erreur lors du chargement des offres");
          setOffers([]); // pour éviter erreur .map si non tableau
        });
    }, []);


  if (error) {
    return <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      Erreur : {error}</div>;
    }

  return (
    <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <h2>Liste des promotions : </h2>
      <br/>
      <ul>
        {offers.map((offer) => (
          <li key={offer.id_promotion}>
            {offer.code} - {offer.montant_reduction}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Offers;
