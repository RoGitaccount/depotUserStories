// inserer un utilisateur
export function Insert_user(
  client,
  { nom, prenom, email, role = "user", password, telephone },
  callback
) {
  const query =
    "INSERT INTO `users` (nom, prenom, email, role, mdp, telephone) VALUES (?, ?, ?, ?, ?, ?)";
  client.query(
    query,
    [nom, prenom, email, role, password, telephone],
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

