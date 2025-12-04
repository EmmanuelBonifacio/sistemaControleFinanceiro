const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const { autenticacaoMiddleware } = require("../middleware/autenticacao");

// POST - Cadastro de novo usuário
router.post("/cadastro", UsuarioController.cadastro);

// POST - Login  
router.post("/login", UsuarioController.login);

// GET - Obter perfil do usuário (protegido com JWT)
router.get("/usuario/:id", autenticacaoMiddleware, UsuarioController.obterPerfil);

// POST - Logout (protegido com JWT)
router.post("/logout", autenticacaoMiddleware, UsuarioController.logout);

module.exports = router;
