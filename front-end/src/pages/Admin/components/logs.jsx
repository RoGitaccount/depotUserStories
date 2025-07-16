import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDateTimeCombined } from "../../../services/formatDateTime";
import axiosInstance from "../../../services/axiosInstance";


const columns = [
  { key: "id_logs", label: "ID Logs" },
  { key: "id_user", label: "ID Utilisateur" },
  { key: "user_info", label: "Utilisateur" },
  { key: "role", label: "Rôle" },
  { key: "endpoint", label: "Endpoint" },
  { key: "methode", label: "Méthode" },
  { key: "statut", label: "Statut" },
  { key: "activite", label: "Activité" },
  { key: "ip_address", label: "IP" },
  { key: "user_agent", label: "User Agent" },
  { key: "date_activite", label: "Date" },
  { key: "occurences", label: "Occurences" },
];

const allowedSort = ["date_activite", "occurences"];
const defaultSort = { sortBy: "date_activite", order: "DESC" };

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [error, setError] = useState(null);

  const [filterIdUser, setFilterIdUser] = useState("");
  const [filterEndpoint, setFilterEndpoint] = useState("");
  const [filterMethode, setFilterMethode] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterActivite, setFilterActivite] = useState("");
  const [filterUtilisateur, setFilterUtilisateur] = useState("");
  const [filterIp, setFilterIp] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [sort, page]);

  const fetchUsers = async () => {
  try {
    const res = await axiosInstance.get("/logs/users");
    const map = {};
    res.data.forEach(u => {
      map[u.id_user] = u;
    });
    setUsers(map);
  } catch {
    setUsers({});
  }
};

const fetchLogs = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await axiosInstance.get("/logs", {
      params: {
        page,
        limit,
        sortBy: allowedSort.includes(sort.sortBy) ? sort.sortBy : "date_activite",
        order: sort.order,
        id_user: filterIdUser || undefined,
        endpoint: filterEndpoint || undefined,
        methode: filterMethode || undefined,
        statut: filterStatut || undefined,
        activite: filterActivite || undefined,
        utilisateur: filterUtilisateur || undefined,
        ip_address: filterIp || undefined,
      }
    });
    setLogs(res.data);
    if (res.data.length === 0 && page > 1) {
      setPage(page - 1);
    }
  } catch {
    setError("Erreur lors du chargement des logs.");
  } finally {
    setLoading(false);
  }
};

  const handleSort = (key) => {
    if (!allowedSort.includes(key)) return;
    setSort(prev => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === "DESC" ? "ASC" : "DESC",
    }));
    setPage(1);
  };

  const renderUserInfo = (id_user) => {
    if (!id_user || !users[id_user]) return <span className="italic text-gray-400 dark:text-gray-500">utilisateur supprimé</span>;
    const { nom, prenom } = users[id_user];
    return `${prenom} ${nom}`;
  };

  const renderUserRole = (id_user) => {
    if (!id_user || !users[id_user]) return <span className="italic text-gray-400 dark:text-gray-500">-</span>;
    return users[id_user].role;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setFilterIdUser("");
    setFilterEndpoint("");
    setFilterMethode("");
    setFilterStatut("");
    setFilterActivite("");
    setFilterUtilisateur("");
    setFilterIp("");
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="container mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Logs d'activité</h1>
      <form className="flex flex-wrap items-center mb-4 gap-2" onSubmit={handleSearchSubmit}>
        {[filterIdUser, filterEndpoint, filterMethode, filterStatut, filterActivite, filterUtilisateur, filterIp].map((value, idx) => (
          <input
            key={idx}
            type="text"
            value={value}
            onChange={(e) => [
              setFilterIdUser, setFilterEndpoint, setFilterMethode, setFilterStatut, setFilterActivite, setFilterUtilisateur, setFilterIp
            ][idx](e.target.value)}
            placeholder={["ID Utilisateur", "Endpoint", "Méthode", "Statut", "Activité", "Utilisateur (nom/prénom)", "IP"][idx]}
            className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Filtrer</button>
        <button type="button" className="ml-2 px-3 py-1 rounded border dark:border-gray-600" onClick={handleReset}>
          Réinitialiser
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2 border-b dark:border-gray-700 ${allowedSort.includes(col.key) ? "cursor-pointer" : ""}`}
                  onClick={() => allowedSort.includes(col.key) && handleSort(col.key)}
                >
                  {col.label}
                  {allowedSort.includes(col.key) && sort.sortBy === col.key && (
                    <span> {sort.order === "ASC" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Chargement...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Aucun log trouvé.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id_logs} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.id_logs}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.id_user ?? <span className="italic text-gray-400">-</span>}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{renderUserInfo(log.id_user)}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{renderUserRole(log.id_user)}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.endpoint}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.methode}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.statut}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.activite}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.ip_address}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.user_agent}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{formatDateTimeCombined(log.date_activite)}</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">{log.occurences}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPage;
