var mysql = require('mysql');

var con = mysql.createPool({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME
});

try {
    console.log("DataBase Successfully Connectd")
} catch (error) {
    console.log("DataBase Not Connected",error)
}

module.exports = con;