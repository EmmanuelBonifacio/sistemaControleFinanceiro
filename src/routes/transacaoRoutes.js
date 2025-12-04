const express = require("express");
const router = express.Router();
const TransacaoController = require("../controllers/TransacaoController");
const { autenticacaoMiddleware } = require("../middleware/autenticacao");
const { validarTransacao, validarAtualizacaoTransacao, handleValidationErrors } = require("../middleware/validacao");

// Aplicar autenticação em todas as rotas de transação
router.use(autenticacaoMiddleware);

// GET - Listar transações do usuário
router.get("/usuario/:usuarioId", TransacaoController.listarPorUsuario);

// GET - Obter uma transação específica
router.get("/:id", TransacaoController.obter);

// POST - Criar nova transação
router.post("/", validarTransacao, handleValidationErrors, TransacaoController.criar);

// PUT - Atualizar transação
router.put("/:id", validarAtualizacaoTransacao, handleValidationErrors, TransacaoController.atualizar);

// DELETE - Deletar transação
router.delete("/:id", TransacaoController.deletar);

// GET - Buscar transações por mês/ano
router.get("/mes/:usuarioId/:mes/:ano", TransacaoController.buscarPorMes);

// GET - Obter resumo das transações
router.get("/resumo/:usuarioId", TransacaoController.obterResumo);

module.exports = router;
