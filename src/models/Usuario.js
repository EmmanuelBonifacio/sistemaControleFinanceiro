const db = require("../../db");

class Usuario {
  // Buscar usuário por email
  static buscarPorEmail(email, callback) {
    const query = "SELECT * FROM usuarios WHERE email = ?";
    db.query(query, [email], callback);
  }

  // Buscar usuário por ID
  static buscarPorId(id, callback) {
    const query = "SELECT id, name, email FROM usuarios WHERE id = ?";
    db.query(query, [id], callback);
  }

  // Criar novo usuário
  static criar(name, email, password, callback) {
    const query =
      "INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, password], callback);
  }

  // Validar login
  static validarLogin(email, password, callback) {
    const query = "SELECT * FROM usuarios WHERE email = ? AND password = ?";
    db.query(query, [email, password], callback);
  }
}

module.exports = Usuario;
