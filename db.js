// ==========================================
// 🔐 Carregar variáveis de ambiente
// ==========================================
require("dotenv").config();

const mysql = require("mysql2");

// ==========================================
// 📊 Configuração do Banco de Dados
// ==========================================
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "controle_financeiro",
  port: process.env.DB_PORT || 3306,
});

// ==========================================
// 🔗 Conectar ao MySQL
// ==========================================
connection.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
    return;
  }
  console.log("✅ Conectado ao MySQL!");
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
});

module.exports = connection;
