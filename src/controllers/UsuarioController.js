const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

class UsuarioController {
  // POST /cadastro
  static cadastro(req, res) {
    try {
      const { name, email, password } = req.body;

      Usuario.criar(name, email, password, (err, result) => {
        if (err) {
          return res.status(400).json({ erro: "Email já registrado" });
        }
        res.status(201).json({
          mensagem: "Cadastro realizado com sucesso!",
          id: result.insertId,
          name: name,
          email: email,
        });
      });
    } catch (error) {
      console.error("Erro em cadastro:", error);
      res.status(500).json({ erro: "Erro ao processar cadastro" });
    }
  }

  // POST /login
  static login(req, res) {
    try {
      const { email, password } = req.body;

      Usuario.validarLogin(email, password, (err, results) => {
        try {
          if (err) {
            return res.status(500).json({ erro: "Erro no servidor" });
          }

          if (!results || results.length === 0) {
            return res.status(401).json({ erro: "Email ou senha inválidos" });
          }

          const usuario = results[0];
          const secret = process.env.JWT_SECRET || "chave_secreta_default";

          const token = jwt.sign(
            { id: usuario.id, email: usuario.email, name: usuario.name },
            secret,
            { expiresIn: "7d" }
          );

          return res.json({
            mensagem: "Login realizado com sucesso!",
            token: token,
            usuario: {
              id: usuario.id,
              email: usuario.email,
              name: usuario.name,
            },
          });
        } catch (innerError) {
          console.error("Erro em callback de login:", innerError);
          return res.status(500).json({ erro: "Erro ao processar login" });
        }
      });
    } catch (error) {
      console.error("Erro em login:", error);
      res.status(500).json({ erro: "Erro ao processar login" });
    }
  }

  // GET /usuario/:id
  static obterPerfil(req, res) {
    try {
      const { id } = req.params;

      if (req.usuario.id !== parseInt(id)) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      Usuario.buscarPorId(id, (err, results) => {
        if (err) {
          return res.status(500).json({ erro: "Erro ao buscar usuário" });
        }

        if (!results || results.length === 0) {
          return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        res.json(results[0]);
      });
    } catch (error) {
      console.error("Erro em obterPerfil:", error);
      res.status(500).json({ erro: "Erro ao buscar perfil" });
    }
  }

  // POST /logout
  static logout(req, res) {
    try {
      res.json({ mensagem: "Logout realizado com sucesso!" });
    } catch (error) {
      console.error("Erro em logout:", error);
      res.status(500).json({ erro: "Erro ao fazer logout" });
    }
  }
}

module.exports = UsuarioController;
