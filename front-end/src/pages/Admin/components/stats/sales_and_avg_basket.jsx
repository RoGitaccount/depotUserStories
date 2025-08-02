import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import axiosInstance from "../../../../services/axiosInstance";
import { formatDateTimeCombined } from "../../../../services/formatDateTime";

const COLORS = {
  commandes: "#3B82F6",
  ventes: "#10B981",
  panier: "#F59E0B"
};

export default function SimpleBarChartSales() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/stats/sales?period=${period}`)
      .then((res) => {
              const formatted = res.data.data.map((item) => {
        let periode;
        if (period === "month") {
          periode = `${item.annee}/${String(item.mois).padStart(2, "0")}`;
        } else if (period === "year") {
          periode = `${item.periode}`;
        } else {
          // Format JJ/MM/AAAA
          const [year, month, day] = item.periode.split("T")[0].split("-");
          periode = `${year}/${month}/${day}`;
        }

        return {
          periode,
          nb_commandes: item.nb_commandes,
          total_ventes: item.total_ventes,
          panier_moyen: item.panier_moyen
        };
      })

        setData(formatted.reverse());
      })
      .catch((err) => {
        console.error("Erreur récupération stats:", err);
        setError("Erreur lors du chargement des statistiques.");
      });
  }, [period]);

  return (
    // <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[580px] overflow-y-auto">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ">
      <h2 className="text-xl font-bold mb-4">Statistiques de ventes</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Période :</label>
        <select
          className="border rounded-md border-gray-300 p-2 py-2 dark:bg-gray-800 dark:text-white" 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="day">7 derniers jours</option>
          <option value="month">12 derniers mois</option>
          <option value="year">5 dernières années</option>
        </select>
      </div>

     {error ? (
  <p className="text-red-600">{error}</p>
) : (
  <div className="flex items-center justify-center h-full">
    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={data}
        margin={{ top: 60, right: 10, left: 40, bottom: 0 }}
        barCategoryGap={10}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="periode" tick={{ fontSize: 12 }} interval={0} />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <text
          x={50}
          y={40}
          fill={"#ae3535ff"}
          fontSize={16}
          fontWeight="bold"
        >
          Montant (€)
        </text>
        <text
          x="98%"
          y={40}
          textAnchor="end"
          fill={"#ae3535ff"}
          fontSize={16}
          fontWeight="bold"
        >
          Commandes
        </text>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
        <Bar yAxisId="right" dataKey="nb_commandes" name="Commandes" fill={COLORS.commandes} />
        <Bar yAxisId="left" dataKey="total_ventes" name="Ventes (€)" fill={COLORS.ventes} />
        <Bar yAxisId="left" dataKey="panier_moyen" name="Panier Moyen (€)" fill={COLORS.panier} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

    </div>
  );
}
