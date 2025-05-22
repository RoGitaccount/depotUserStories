import mysql from "mysql2"
import 'dotenv/config'

console.log("Configuration MySQL :", {
    host: process.env.MYSQL_SERVER,
    user: process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD ? "**********" : "NON FOURNI",
    database: process.env.MYSQL_DATABASE,
  });
  
try {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_SERVER,
    user: process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ Échec de la connexion MySQL :", err.message);
    } else {
      console.log("✅ Connexion MySQL établie avec succès !");
    }
  });

  // Tu peux ensuite utiliser `connection` ici pour exécuter tes requêtes

} catch (error) {
  console.error("🚨 Erreur lors de l'initialisation de la connexion :", error.message);
}
  
function getConnection() {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_SERVER,
    user:  process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });
  return connection;
}

export {getConnection};