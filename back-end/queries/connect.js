import mysql from "mysql2";
import 'dotenv/config';

console.log("Configuration MySQL :", {
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_LOGIN,
  password: process.env.MYSQL_PASSWORD ? "**********" : "NON FOURNI",
  database: process.env.MYSQL_DATABASE,
});

const pool = mysql.createPool({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_LOGIN,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 100
});

function getConnection(callback) {
  pool.getConnection((err, connection) => {
    callback(err, connection);
  });
}

export { getConnection };