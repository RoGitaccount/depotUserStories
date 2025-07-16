// Ajouter une promotions
export function Insert_offer(client, { code, montant_reduction, date_expiration, est_actif}, callback) {
  const query = "INSERT INTO promotions (code, montant_reduction, date_expiration, est_actif) VALUES (?, ?, ?, ?)";
  client.query(query, [code, montant_reduction, date_expiration, est_actif], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Récupérer une promotion par son id (server receive offer)
export function Get_offer(client,id_promotion,callback) {
  const query = `SELECT code, montant_reduction, date_expiration
                 FROM promotions
                 WHERE id_promotion = ?
                  AND est_actif = TRUE
                  AND date_expiration > NOW()
                 limit 1`;
  client.query(query,[id_promotion],(err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0){
      return callback(null, null)
    };
    callback(null, results[0]);
  });
}

// Récupérer une promotion par son code (user type a code and receive offer)
export function Get_offer_by_code(client,code,callback) {
  const query = `SELECT id_promotion, montant_reduction, date_expiration
                 FROM promotions
                 WHERE code = ?
                  AND est_actif = TRUE
                  AND date_expiration > NOW()
                 limit 1`;
  client.query(query,[code],(err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0){
      return callback(null, null)
    };
    callback(null, results[0]);
  });
}

export function Get_all_offers_admin(client, callback) {
  const query = `
    SELECT id_promotion, code, montant_reduction, date_expiration, est_actif
    FROM promotions
    ORDER BY date_expiration DESC
  `;
  client.query(query, (err, results) => {
    if (err){
      return callback(err, null);
    }
     callback(null, results);
    }); // retourne un tableau [ {}, {}, ... ]
}

export function Get_one_offer_admin(client, id_promotion, callback) {
  const query = `
    SELECT id_promotion, code, montant_reduction, date_expiration, est_actif
    FROM promotions
    WHERE id_promotion = ?
    LIMIT 1
  `;
  client.query(query, [id_promotion], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0){ //vérifie si la promo existe
      return callback(null, null)
    };
    callback(null, results[0]); //retourne un objet {}
  });
}

//activé/désactivé une promotion
export function toggle_availability(client,id_promotion,callback)
{
  const query="UPDATE promotions SET est_actif = NOT est_actif WHERE id_promotion = ?"
  client.query(query,[id_promotion],(err,results)=>{
    if (err) {
      return callback(err,null);
    }
    callback(null,results);
  });
}

// Modifier une promotions
export function Update_offer(client, { id_promotion, code, montant_reduction, date_expiration, est_actif }, callback) {
  const query = "UPDATE promotions SET code = ?, montant_reduction = ?, date_expiration = ?, est_actif = ? WHERE id_promotion = ?";
  client.query(query, [code, montant_reduction, date_expiration, est_actif, id_promotion], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Supprimer une promotions
export function Delete_offer(client, id_promotion, callback) {
  const query = "DELETE FROM promotions WHERE id_promotion = ?";
  client.query(query, [id_promotion], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// __________nouvel ajout_________________

// Enregistrer l'utilisation d'un code promo par un utilisateur
export function Record_offer_usage(client, id_user, id_promotion, callback) {
  console.log('Tentative d\'enregistrement:', { id_user, id_promotion });
  const query = `
    INSERT INTO utilisations_promotions (id_user, id_promotion)
    VALUES (?, ?)
  `;
  client.query(query, [id_user, id_promotion], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return callback(err);
    }
    console.log('Enregistrement réussi:', results);
    callback(null, results);
  });
}

// Vérifier si un utilisateur a déjà utilisé un code promo (retourne 1 s'il est présent) 
export function Has_user_used_offer(client, id_user, id_promotion, callback) {
  const query = `
    SELECT 1 FROM utilisations_promotions
    WHERE id_user = ? AND id_promotion = ?
    LIMIT 1
  `;
  client.query(query, [id_user, id_promotion], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.length > 0); // true = déjà utilisé
  });
}

// Récupérer les codes promo déjà utilisés par un utilisateur
export function Get_used_offers_by_user(client, id_user, callback) {
  const query = `
    SELECT p.code, p.montant_reduction, up.date_utilisation
    FROM utilisations_promotions up
    JOIN promotions p ON up.id_promotion = p.id_promotion
    WHERE up.id_user = ?
    ORDER BY up.date_utilisation DESC
  `;
  client.query(query, [id_user], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Si une commande est annulée,suppression de l’utilisation de la promotion associée
export function Delete_offer_usage(client, id_user, id_promotion, callback) {
  const sql = `DELETE FROM utilisations_promotions WHERE id_user = ? AND id_promotion = ?`;
  client.query(sql, [id_user, id_promotion], callback);
}

// Récupérer toutes les promos disponibles pour un utilisateur (non utilisées, actives et non expirées)
export function Get_available_offers_for_user(client, id_user, callback) {
  const sql = `
    SELECT * FROM promotions p
    WHERE est_actif = TRUE
      AND date_expiration > NOW()
      AND id_promotion NOT IN (
        SELECT id_promotion FROM utilisations_promotions WHERE id_user = ?
      )
  `;
  client.query(sql, [id_user], callback);
}