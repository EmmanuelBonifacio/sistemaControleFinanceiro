const Usuario = require("../models/Usuario");

class UsuarioController {
  // POST /cadastro
  static cadastro(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ erro: "Nome, email e senha são obrigatórios" });
    }

    Usuario.criar(name, email, password, (err, result) => {
      if (err) {
        return res.status(400).json({ erro: "Email já existe" });
      }
      res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
    });
  }

  // POST /login
  static login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    Usuario.validarLogin(email, password, (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      const usuario = results[0];
      res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: {
          id: usuario.id,
          email: usuario.email,
          name: usuario.name,
        },
      });
    });
  }

  // GET /usuario/:id
  static obterPerfil(req, res) {
    const { id } = req.params;

    Usuario.buscarPorId(id, (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar usuário" });
      }

      if (results.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      res.json(results[0]);
    });
  }
}

module.exports = UsuarioController;
