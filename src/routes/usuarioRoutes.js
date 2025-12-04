const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");

// POST - Cadastro de novo usuário
router.post("/cadastro", UsuarioController.cadastro);

// POST - Login
router.post("/login", UsuarioController.login);

// GET - Obter perfil do usuário
router.get("/usuario/:id", UsuarioController.obterPerfil);

module.exports = router;
