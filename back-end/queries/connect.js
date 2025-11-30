import mysql from "mysql2";
import 'dotenv/config';

if (process.env.NODE_ENV !== 'test') {
  console.log("Configuration MySQL :", {
    host: process.env.MYSQL_SERVER,
    user: process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD ? "**********" : "NON FOURNI",
    database: process.env.MYSQL_DATABASE,
  });
}

let pool;

if (process.env.NODE_ENV !== 'test') {
  pool = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    user: process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 100
  });
}

function getConnection(callback) {
  if (process.env.NODE_ENV === 'test') {
    // Mock minimal pour Jest : toutes les requêtes renvoient un tableau vide
    const mockClient = {
      query: (sql, params, cb) => {
        cb(null, []); // renvoie un tableau vide
      },
      release: () => {}
    };
    return callback(null, mockClient);
  }

  // Connexion réelle
  pool.getConnection((err, connection) => {
    callback(err, connection);
  });
}

export { getConnection };
