export function Get_logs(
  client,
  {
    page = 1,
    limit = 20,
    sortBy = "date_activite",
    order = "DESC",
    filters = {},
  },
  callback
) {
  const allowedSort = [
    "date_activite", "occurences", "id_user", "methode", "statut", "ip_address", "endpoint", "role"
  ];
  const sortColumn = allowedSort.includes(sortBy) ? sortBy : "date_activite";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (filters.id_user) {
    where.push("logs.id_user = ?");
    params.push(filters.id_user);
  }
    // Pour recherche partielle (LIKE) 
  if (filters.endpoint) {
    where.push("logs.endpoint LIKE ?");
    params.push(`%${filters.endpoint}%`);
  }
  if (filters.methode) {
  where.push("logs.methode LIKE ?");
  params.push(`%${filters.methode}%`);
  }
  if (filters.statut) {
  where.push("logs.statut LIKE ?");
  params.push(`%${filters.statut}%`);
  }
  if (filters.activite) {
    where.push("logs.activite LIKE ?");
    params.push(`%${filters.activite}%`);
  }
  if (filters.ip_address) {
    where.push("logs.ip_address LIKE ?");
    params.push(`%${filters.ip_address}%`);
  }
  if (filters.utilisateur) {
    where.push("(users.nom LIKE ? OR users.prenom LIKE ?)");
    params.push(`%${filters.utilisateur}%`, `%${filters.utilisateur}%`);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  const sql = `
    SELECT 
      logs.id_logs, logs.id_user, logs.endpoint, logs.methode, logs.statut, logs.activite,
      logs.ip_address, logs.user_agent, logs.date_activite, logs.occurences,
      users.nom, users.prenom, users.role
    FROM logs
    LEFT JOIN users ON logs.id_user = users.id_user
    ${whereClause}
    ORDER BY ${sortColumn === "role" ? "users.role" : "logs." + sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));
  client.query(sql, params, callback);
}