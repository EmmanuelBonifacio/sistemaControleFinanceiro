const db = require("../../db");
const bcrypt = require("bcryptjs");

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

  // Criar novo usuário com senha criptografada
  static criar(name, email, password, callback) {
    // Hash da senha com salt de 10
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return callback(err);
      }

      const query =
        "INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)";
      db.query(query, [name, email, hash], callback);
    });
  }

  // Validar login comparando senha com hash
  static validarLogin(email, password, callback) {
    const query = "SELECT * FROM usuarios WHERE email = ?";

    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err);
      }

      // Se usuário não encontrado
      if (results.length === 0) {
        return callback(null, []);
      }

      const usuario = results[0];

      // Comparar senha com hash armazenado
      bcrypt.compare(password, usuario.password, (err, isValid) => {
        if (err) {
          return callback(err);
        }

        // Se senha está correta, retornar usuário
        if (isValid) {
          return callback(null, results);
        }

        // Se senha está incorreta, retornar vazio
        return callback(null, []);
      });
    });
  }
}

module.exports = Usuario;
