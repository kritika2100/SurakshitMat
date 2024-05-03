var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "IntegratedProject"
});
conn.connect(function (err) {
    if (err)
        throw err;
});
module.exports = conn;