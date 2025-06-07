// // inserer un utilisateur
// export function Insert_user(
//   client,
//   { nom, prenom, email, role = "user", password },
//   callback
// ) {
//   const query =
//     "INSERT INTO `users` (nom, prenom, email, role, mdp) VALUES (?, ?, ?, ?, ?)";
//   client.query(
//     query,
//     [nom, prenom, email, role, password],
//     (err, results) => {
//       if (err) {
//         return callback(err, null);
//       }
//       callback(null, results);
//     }
//   );
// }

// // affiche l'utilisateur avec l'email correspondant
// export function GetUserByEmail(client, email, callback) {
//   const query = "SELECT * FROM users WHERE email = ?";
//   client.query(query, [email], (err, results) => {
//     if (err) {
//       return callback(err, null);
//     }

//     if (results.length > 0) {
//       return callback(null, { exists: true, results });
//     }

//     callback(null, { exists: false, results });
//   });
// }

// export function Update_user_phone(client, id_user, telephone, callback) {
//   const query = `
//     UPDATE users SET
//     telephone = COALESCE(?, telephone)
//     WHERE id_user = ?
//   `;
//   client.query(query, [telephone, id_user], callback);
// }


// ______github____///

// inserer un utilisateur
export function Insert_user(
  client,
  { nom, prenom, email, role = "user", password, secretkey},
  callback
) {
  const query =
    "INSERT INTO `users` (nom, prenom, email, role, mdp, secretkey) VALUES (?, ?, ?, ?, ?, ?)";
  client.query(
    query,
    [nom, prenom, email, role, password, secretkey],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
}

// affiche l'utilisateur avec l'email correspondant
export function GetUserByEmail(client, email, callback) {
  const query = "SELECT * FROM users WHERE email = ?";
  client.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length > 0) {
      return callback(null, { exists: true, results });
    }

    callback(null, { exists: false, results });
  });
}

export function Update_user_phone(client, id_user, telephone, callback) {
  const query = `
    UPDATE users SET
    telephone = COALESCE(?, telephone)
    WHERE id_user = ?
  `;
  client.query(query, [telephone, id_user], callback);
}

export function GetUserById(client, id_user, callback) {
  const query = "SELECT id_user, email, secretkey FROM users WHERE id_user = ?";
  client.query(query, [id_user], (err, results) => {
    if (err) return callback(err);
    callback(null, { exists: results.length > 0, results });
  });
}

// __           _//