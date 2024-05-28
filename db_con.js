// require('dotenv').config();
// var mysql = require('mysql');


// var conn = mysql.createConnection({
//     host: process.env.HOST|"localhost",
//     user: process.env.USER|"root",
//     password:process.env.PASSWORD|"password",
//     database:process.env.DATABASE|"IntegratedProject"
// });
// conn.connect(function (err) {
//     if (err)
//         throw err;
// });
// module.exports = conn;
require('dotenv').config();
const mysql = require('mysql');

// Create a MySQL connection pool using environment variables
const pool = mysql.createPool({
    port: process.env.DB_PORT || 3306,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'IntegratedProject',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}).on("error", (err) => {
    console.log("Failed to connect to Database - ", err);
});

module.exports = pool;
