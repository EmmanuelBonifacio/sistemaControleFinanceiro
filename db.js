const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Emanuel2014@",
  database: "controle_financeiro",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
    return;
  }
  console.log("Conectado ao MySQL!");
});

module.exports = connection;
