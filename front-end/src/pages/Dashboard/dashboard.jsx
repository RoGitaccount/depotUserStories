import React, { useEffect, useState } from "react";
import axios from "axios";
import RedirectButton from '../../components/PageComponents/RedirectButton';
import axiosInstance from "../../services/axiosInstance";

const STATIC_FILTERS = [
  { label: "Toutes", value: "all" },
  { label: "7 derniers jours", value: "7days" },
  { label: "1 mois", value: "1month" },
  { label: "6 mois", value: "6months" },
];

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [years, setYears] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");

  // Récupérer les années des commandes
  useEffect(() => {
    axiosInstance.get("/userdashboard/orders-years")
      .then((res) => {
        setYears(res.data.years || []);
      })
      .catch(() => {
        console.warn("Erreur lors du chargement des années");
      });
  }, []);

  // Infos personnelles
  useEffect(() => {
    axiosInstance.get("/userdashboard/info")
      .then((res) => {
        setUserInfo(res.data[0] || res.data);
        setLoadingInfo(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des infos utilisateur.");
        setLoadingInfo(false);
      });
  }, []);

  // // Historique commandes
  // useEffect(() => {
  //   setLoadingOrders(true);
  //   let url = `http://localhost:8001/api/userdashboard/orders-history?filter_date=${filter}`;
  //   if (filter === "year" && selectedYear) {
  //     url += `&annee_val=${selectedYear}`;
  //   }

  //   axios
  //     .get(url, {
  //       withCredentials: true,
  //     })
  //     .then((res) => {
  //       const merged = {};
  //       res.data.forEach((order) => {
  //         if (!merged[order.id_commande]) {
  //           merged[order.id_commande] = {
  //             ...order,
  //             produits: [],
  //           };
  //         }
  //         merged[order.id_commande].produits.push({
  //           titre: order.titre,
  //           description: order.description,
  //           id_produit: order.id_produit,
  //         });
  //       });
  //       const sorted = Object.values(merged).sort(
  //         (a, b) => new Date(b.date_commande) - new Date(a.date_commande)
  //       );
  //       setOrders(sorted);
  //       setLoadingOrders(false);
  //     })
  //     .catch(() => {
  //       setError("Erreur lors du chargement de l'historique des commandes.");
  //       setLoadingOrders(false);
  //     });
  // }, [filter, selectedYear]);

  // Historique des commandes (filtrées)
useEffect(() => {
  const fetchOrderHistory = async () => {
    setLoadingOrders(true);

    try {
      // Construction dynamique de l'URL de l'API
      let endpoint = `/userdashboard/orders-history?filter_date=${filter}`;
      if (filter === "year" && selectedYear) {
        endpoint += `&annee_val=${selectedYear}`;
      }

      const res = await axiosInstance.get(endpoint);

      // Fusionner les lignes ayant le même id_commande
      const commandesMap = {};

      res.data.forEach((order) => {
        const { id_commande, titre, description, id_produit } = order;

        if (!commandesMap[id_commande]) {
          commandesMap[id_commande] = {
            ...order,
            produits: [],
          };
        }

        commandesMap[id_commande].produits.push({ titre, description, id_produit });
      });

      // Trier par date de commande (décroissante)
      const commandesTriees = Object.values(commandesMap).sort(
        (a, b) => new Date(b.date_commande) - new Date(a.date_commande)
      );

      setOrders(commandesTriees);
      setLoadingOrders(false);
    } catch (error) {
      setError("Erreur lors du chargement de l'historique des commandes.");
      setLoadingOrders(false);
    }
  };

  fetchOrderHistory();
}, [filter, selectedYear]);


  // Gestion du filtre
  const handleFilterChange = (e) => {
    const val = e.target.value;
    if (STATIC_FILTERS.map((f) => f.value).includes(val)) {
      setFilter(val);
      setSelectedYear("");
    } else {
      setFilter("year");
      setSelectedYear(val);
    }
  };

  return (
      <div className="flex flex-col md:flex-row gap-8 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      {/* Historique des commandes */}
      <section className="md:w-2/3 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historique de mes commandes</h2>
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter === "year" ? selectedYear || "year" : filter}
            onChange={handleFilterChange}
          >
            {STATIC_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
            {years.length > 0 && (
              <optgroup label="Par année">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {loadingOrders ? (
          <p className="text-gray-500 dark:text-gray-300">Chargement...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic">Aucune commande trouvée.</p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li
                key={order.id_commande}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 transition"
              >
                <div className="flex flex-wrap gap-4 text-sm text-gray-800 dark:text-gray-200 mb-2">
                  <div>
                    <strong>Commande n° :</strong> {order.id_commande}
                  </div>
                  <div>
                    <strong>Commande effectuée le :</strong>{" "}
                    {order.date_commande ? new Date(order.date_commande).toLocaleString() : "N/A"}
                  </div>
                  <div>
                    <strong>Statut :</strong>{" "}
                    <span className="capitalize">{order.statut}</span>
                  </div>
                  <div>
                    <strong>Total :</strong> {order.montant_total} €
                  </div>
                </div>

                <div className="mb-2">
                  <strong className="text-gray-800 dark:text-gray-200">Produits :</strong>
                  <ul className="ml-5 list-disc text-gray-700 dark:text-gray-300">
                    {order.produits.map((prod, idx) => (
                      <li key={prod.id_produit || idx}>
                        <span className="font-medium">{prod.titre}</span>
                        {prod.description && ` — ${prod.description}`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-gray-800 dark:text-gray-200">Paiement effectué le :</strong>{" "}
                  {order.date_transaction ? new Date(order.date_transaction).toLocaleString() : "N/A"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Infos personnelles */}
      <section className="md:w-1/3 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-2">
          Mes informations
        </h2>

        {loadingInfo ? (
          <p className="text-gray-500 dark:text-gray-300">Chargement...</p>
        ) : userInfo ? (
          <div className="space-y-4 text-gray-700 dark:text-gray-200">
            <p>
              <strong>Nom :</strong> {userInfo.nom}
            </p>
            <p>
              <strong>Prénom :</strong> {userInfo.prenom}
            </p>
            <p>
              <strong>Email :</strong> {userInfo.email}
            </p>

            <div className="pt-4 space-y-2">
              <RedirectButton to="/MyData" className="w-fit px-6 py-2 ">
                Accéder à mes données
              </RedirectButton>

              <br />
              <a
                href="http://localhost:5173/Contact"
                className="text-blue-600 hover:text-blue-800 underline font-medium transition"
              >
                Nous contacter
              </a>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Impossible de charger les informations.</p>
        )}

        {error && <div className="text-red-600 mt-4 font-medium">{error}</div>}
      </section>
    </div>
  );
}
