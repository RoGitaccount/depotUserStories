// CREATE TABLE promotions (
//   id_promotion INT AUTO_INCREMENT PRIMARY KEY,
//   code VARCHAR(50) UNIQUE,
//   montant_reduction DECIMAL(10, 2),
//   date_expiration DATETIME,
//   est_actif BOOLEAN DEFAULT FALSE //modification TRUE à FALSE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
export function Update_offer(client, { id_promotion,code, montant_reduction, date_expiration }, callback) {
  const query = "UPDATE promotions SET code = ?, montant_reduction = ?, date_expiration = ? WHERE id_promotion = ?";
  client.query(query, [code, montant_reduction, date_expiration,id_promotion], (err, results) => {
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

