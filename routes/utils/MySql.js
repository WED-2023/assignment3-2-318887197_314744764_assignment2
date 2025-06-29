var mysql = require('mysql2');
require("dotenv").config();


// const config={
// connectionLimit:4,
//   host: process.env.host,//"localhost"
//   user: process.env.user,//"root"
//   password: process.env.DBpassword,
//   database:process.env.database
//   // database:"mydb"
// }
// const pool = new mysql.createPool(config);

const pool = mysql.createPool({
  host: '127.0.0.1', // or your DB host
  user: 'root',
  password: '1234',
  database: 'mydb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connection =  () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) reject(err);
    console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return new Promise((resolve, reject) => {
         connection.query(sql, binding, (err, result) => {
           if (err) reject(err);
           resolve(result);
           });
         });
       };
       const release = () => {
         return new Promise((resolve, reject) => {
           if (err) reject(err);
           console.log("MySQL pool released: threadId " + connection.threadId);
           resolve(connection.release());
         });
       };
       resolve({ query, release });
     });
   });
 };
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };







