// ========== Paiements ==========

// Créer ou mettre à jour un paiement

export function Upsert_payment(client, {
  id_commande,
  methode_paiement,
  statut_paiement = 'en attente',
  montant_transaction,
  session_stripe_id,
  transaction_id
}, callback) {
  const query = `
    INSERT INTO paiements (
      id_commande,
      methode_paiement,
      statut_paiement,
      montant_transaction,
      session_stripe_id,
      transaction_id
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      methode_paiement = COALESCE(VALUES(methode_paiement), methode_paiement),
      statut_paiement = COALESCE(VALUES(statut_paiement), statut_paiement),
      montant_transaction = COALESCE(VALUES(montant_transaction), montant_transaction),
      session_stripe_id = COALESCE(VALUES(session_stripe_id), session_stripe_id),
      transaction_id = COALESCE(VALUES(transaction_id), transaction_id),
      date_transaction = CURRENT_TIMESTAMP
  `;
  client.query(query, [
    id_commande,
    methode_paiement,
    statut_paiement,
    montant_transaction,
    session_stripe_id,
    transaction_id
  ], callback);
}

// Mettre à jour un paiement par id
export function Update_payment(client, {
  id_paiement,
  methode_paiement,
  statut_paiement,
  montant_transaction,
  session_stripe_id,
  transaction_id
}, callback) {
  const query = `
    UPDATE paiements SET
      methode_paiement = COALESCE(?, methode_paiement),
      statut_paiement = COALESCE(?, statut_paiement),
      montant_transaction = COALESCE(?, montant_transaction),
      session_stripe_id = COALESCE(?, session_stripe_id),
      transaction_id = COALESCE(?, transaction_id),
      date_transaction = CURRENT_TIMESTAMP
    WHERE id_paiement = ?
  `;
  client.query(query, [
    methode_paiement,
    statut_paiement,
    montant_transaction,
    session_stripe_id,
    transaction_id,
    id_paiement
  ], callback);
}

// Lire les paiements liés à une commande
export function Get_payment_by_order(client, id_commande, callback) {
  const query = `SELECT * FROM paiements WHERE id_commande = ?`;
  client.query(query, [id_commande], callback);
}

// Supprimer un paiement
export function Delete_payment(client, id_paiement, callback) {
  const query = `DELETE FROM paiements WHERE id_paiement = ?`;
  client.query(query, [id_paiement], callback);
}

// ========== Informations de facturation ==========

  // Créer ou mettre à jour les infos de facturation utilisateur
  export function Upsert_billing_info(client, {
    id_user,
    nom_entreprise,
    numero_tva,
    adresse_ligne1,
    adresse_ligne2,
    ville,
    region,
    code_postal,
    pays
  }, callback) {
    const query = `
      INSERT INTO informations_facturation (
        id_user, nom_entreprise, numero_tva,
        adresse_ligne1, adresse_ligne2, ville,
        region,code_postal, pays
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
      ON DUPLICATE KEY UPDATE
        nom_entreprise = COALESCE(VALUES(nom_entreprise), nom_entreprise),
        numero_tva = COALESCE(VALUES(numero_tva), numero_tva),
        adresse_ligne1 = COALESCE(VALUES(adresse_ligne1), adresse_ligne1),
        adresse_ligne2 = COALESCE(VALUES(adresse_ligne2), adresse_ligne2),
        ville = COALESCE(VALUES(ville), ville),
        region = VALUES(region),
        code_postal = COALESCE(VALUES(code_postal), code_postal),
        pays = COALESCE(VALUES(pays), pays)
    `;
    client.query(query, [
      id_user,
      nom_entreprise,
      numero_tva,
      adresse_ligne1,
      adresse_ligne2,
      ville,
      region,
      code_postal,
      pays
    ], callback);
  }

  // Lire les infos de facturation d'un utilisateur
  export function Get_billing_info(client, id_user, callback) {
    const query = `SELECT * FROM informations_facturation WHERE id_user = ?`;
    client.query(query, [id_user], callback);
  }

  // Mettre à jour les infos de facturation d'un utilisateur ( rgpd )
  export function Update_billing_info(client, {
    id_user, nom_entreprise, numero_tva,
    adresse_ligne1, adresse_ligne2, ville,
    region, code_postal, pays
  }, callback) {
    const query = `
      UPDATE informations_facturation SET
        nom_entreprise = COALESCE(?, nom_entreprise),
        numero_tva = COALESCE(?, numero_tva),
        adresse_ligne1 = COALESCE(?, adresse_ligne1),
        adresse_ligne2 = COALESCE(?, adresse_ligne2),
        ville = COALESCE(?, ville),
        region = COALESCE(?, region),
        code_postal = COALESCE(?, code_postal),
        pays = COALESCE(?, pays)
      WHERE id_user = ?
    `;
    client.query(query, [
      nom_entreprise, numero_tva,
      adresse_ligne1, adresse_ligne2, ville,
      region, code_postal, pays,
      id_user
    ], callback);
  }

  // Supprimer les infos de facturation d'un utilisateur (rgpd par la demande de l'utilisateur)
  export function Delete_billing_info(client, id_user, callback) {
    const query = `DELETE FROM informations_facturation WHERE id_user = ?`;
    client.query(query, [id_user], callback);
  }
