import mysql from "mysql2"
import 'dotenv/config'

function getConnection(database) {
  const connection = mysql.createConnection({
    host: 'localhost',
    user:  process.env.MYSQL_LOGIN,
    password: process.env.MYSQL_PASSWRD,
    database: database
  });
  return connection;
}

export {getConnection};