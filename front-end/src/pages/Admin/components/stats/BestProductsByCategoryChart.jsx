import { useEffect, useState } from "react";
import {
  PieChart, Pie, Tooltip, Cell, ResponsiveContainer
} from "recharts";
import axiosInstance from "../../../../services/axiosInstance";

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
];

const RADIAN = Math.PI / 180;

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
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

export default function BestProductsByCategoryChart() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchBestProducts = async (id) => {
    const res = await axiosInstance.get(`/stats/best-products/${id}`);
    return res.data.data;
  };

  const fetchCategoriesWithSales = async () => {
    try {
      const res = await axiosInstance.get("/category");
      const allCategories = res.data || [];

      const validCategories = [];

      for (const cat of allCategories) {
        const produits = await fetchBestProducts(cat.id_categorie);
        if (produits.length > 0) {
          validCategories.push(cat);
        }
      }

      setCategories(validCategories);
      if (validCategories.length > 0) {
        setSelectedId(validCategories[0].id_categorie);
      }

    } catch (err) {
      console.error("Erreur récupération catégories/produits:", err);
      setError("Erreur lors du chargement des catégories ou produits.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithSales();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchBestProducts(selectedId)
        .then(produits => {
          const formatted = produits.map(p => ({
            name: p.titre,
            value: p.nb_article_vendus
          }));
          setData(formatted);
        })
        .catch(err => {
          console.error("Erreur récupération best-products:", err);
          setError("Erreur chargement des produits");
        });
    }
  }, [selectedId]);

  const total = data.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
      <h2 className="text-xl font-bold mb-4">Produits les plus populaires par catégorie</h2>

      {/* Liste déroulante */}
      {loadingCategories ? (
        <p className="text-center text-gray-500">Chargement des catégories...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">Aucune catégorie avec des ventes disponibles.</p>
      ) : (
        <select
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
          onChange={(e) => setSelectedId(e.target.value)}
          value={selectedId || ""}
        >
          {categories.map(cat => (
            <option key={cat.id_categorie} value={cat.id_categorie}>
              {cat.nom_categorie}
            </option>
          ))}
        </select>
      )}

      {/* Pie Chart */}
      <div>
        {data.length > 0 ? (
          <div className="flex justify-center w-full">
            <div
              className="relative w-full flex justify-center items-center mx-auto"
              style={{
                maxWidth: "100%",
                minWidth: 600,
                height: 350,
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
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centre du pie chart */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{total}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {total === 1 ? "Vente" : "Ventes"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedId && (
          <p className="text-center text-gray-500 dark:text-gray-300">Aucun produit à afficher.</p>
        )}
      </div>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
    </div>
  );
}