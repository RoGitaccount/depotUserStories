import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import axiosInstance from "../../../../services/axiosInstance";

const RADIAN = Math.PI / 180;
const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const ventesText = data.value === 1 ? "vente" : "ventes";
    return (
      <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200 text-sm">
        <p className="font-semibold text-gray-800">{data.payload.name}</p>
        <p className="text-blue-600 font-medium">{data.value} {ventesText}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
      className="drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 font-medium">Chargement des données...</p>
    </div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="flex items-center justify-center h-96">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <div className="flex items-center space-x-3">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function PopularCategoriesChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/stats/popular-categories")
      .then((res) => {
        const total = res.data.data.reduce((sum, item) => sum + item.nb_ventes, 0);
        const sorted = res.data.data
          .map(row => ({
            name: row.nom_categorie,
            value: row.nb_ventes,
            total: total
          }))
          .sort((a, b) => b.value - a.value);
        setData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const totalVentes = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Catégories les plus populaires
        </h2>
       <p className="text-gray-600 dark:text-gray-300 text-sm">
          Distribution des ventes par catégorie -{" "}
          <span className="font-medium">{totalVentes.toLocaleString()}</span>{" "}
          {totalVentes === 1 ? "vente" : "ventes"}
        </p>
      </div>

      <div >
        {/* Pie Chart */}
        <div className="flex justify-center w-full">
            <div
              className="relative w-full flex justify-center items-center mx-auto"
              style={{
                maxWidth: 350, // largeur max du graphique
                minWidth: 220, // largeur min pour lisibilité
                height: 350,   // hauteur fixe pour garder la forme
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="90%"
                innerRadius="40%"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre du pie chart */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {totalVentes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {totalVentes === 1 ? "Vente" : "Ventes"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
