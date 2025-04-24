import React, { useEffect, useState } from "react";

const Offers = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8001/api/offers") // Appel du backend
      .then((res) => res.json())
      .then((data) => {
        console.log("Données reçues :", data);
        setOffers(data);
      })
      .catch((err) => console.error("Erreur lors de la récupération :", err));
  }, []);

  return (
    <div>
      <h2>Liste des promotions</h2>
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
