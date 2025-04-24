import mysql from "mysql2"
import 'dotenv/config'

console.log("Configuration MySQL :", {
    host: process.env.MYSQL_SERVER,
    user: process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWORD ? "**********" : "NON FOURNI",
    database: process.env.MYSQL_DATABASE,
  });

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