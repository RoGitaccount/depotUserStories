export function show_sales_and_avg_basket(client, period, callback) {
  let selectClause, groupClause, interval, orderClause, limitClause = "";

  switch (period) {
    case "day":
      selectClause = "DATE(date_commande) AS periode";
      groupClause = "DATE(date_commande)";
      orderClause = "periode DESC";
      limitClause = "LIMIT 7"; // les 7 derniers jours de vente
      interval = "1 YEAR"; // On filtre max 1 an pour limiter la table
      break;
    case "month":
      selectClause = "YEAR(date_commande) AS annee, MONTH(date_commande) AS mois";
      groupClause = "YEAR(date_commande), MONTH(date_commande)";
      orderClause = "annee, mois DESC";
      interval = "12 MONTH";
      break;
    case "year":
      selectClause = "YEAR(date_commande) AS periode";
      groupClause = "YEAR(date_commande)";
      orderClause = "periode DESC";
      interval = "5 YEAR";
      break;
    default:
      selectClause = "DATE(date_commande) AS periode";
      groupClause = "DATE(date_commande)";
      orderClause = "periode DESC";
      limitClause = "LIMIT 7";
      interval = "1 YEAR";
  }

  const query = `
    SELECT 
      ${selectClause},
      COUNT(*) AS nb_commandes,
      SUM(montant_total) AS total_ventes,
      ROUND(SUM(montant_total) / COUNT(*), 2) AS panier_moyen
    FROM commandes
    WHERE statut IN ('payée', 'activée')
      AND date_commande >= DATE_SUB(CURDATE(), INTERVAL ${interval})
    GROUP BY ${groupClause}
    ORDER BY ${orderClause}
    ${limitClause};
  `;

  client.query(query, callback);
}

  export function show_best_product_by_category(client, id_categorie, callback) {
    const query = ` SELECT 
                    p.id_produit,
                    p.titre,
                    COUNT(*) AS nb_article_vendus
                    FROM commandes c
                    JOIN details_commandes dc ON c.id_commande = dc.id_commande
                    JOIN produits p ON dc.id_produit = p.id_produit
                    JOIN produit_categorie pc ON p.id_produit = pc.id_produit
                    JOIN categories cat ON pc.id_categorie = cat.id_categorie
                    WHERE c.statut IN ('payée', 'activée')
                    AND cat.id_categorie = ?
                    GROUP BY p.id_produit, p.titre
                    ORDER BY nb_article_vendus DESC
                    LIMIT 10;`;
    client.query(query, [id_categorie], callback);
  }

// // catégorie la plus populaire

export function show_most_popular_categories(client, callback) {
  const query = `
    SELECT 
      cat.id_categorie,
      cat.nom_categorie,
      COUNT(*) AS nb_ventes
    FROM commandes c
    JOIN details_commandes dc ON c.id_commande = dc.id_commande
    JOIN produits p ON dc.id_produit = p.id_produit
    JOIN produit_categorie pc ON p.id_produit = pc.id_produit
    JOIN categories cat ON pc.id_categorie = cat.id_categorie
    WHERE c.statut IN ('payée', 'activée')
    GROUP BY cat.id_categorie, cat.nom_categorie
    ORDER BY nb_ventes DESC
    LIMIT 10;
  `;

  client.query(query, callback);
}




