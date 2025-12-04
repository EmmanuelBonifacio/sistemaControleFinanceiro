// ==========================================
// 🔌 API REST - Sistema de Controle Financeiro
// ==========================================
// Base URL: http://localhost:3000/api/v1

const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const TransacaoController = require("../controllers/TransacaoController");

// ==========================================
// 🔐 ROTAS DE AUTENTICAÇÃO (Usuários)
// ==========================================

/**
 * @POST /api/v1/auth/cadastro
 * @description Registrar novo usuário
 * @body { name, email, password }
 * @returns { mensagem, usuario }
 */
router.post("/auth/cadastro", UsuarioController.cadastro);

/**
 * @POST /api/v1/auth/login
 * @description Fazer login e retornar dados do usuário
 * @body { email, password }
 * @returns { mensagem, usuario: { id, email, name } }
 */
router.post("/auth/login", UsuarioController.login);

/**
 * @GET /api/v1/auth/perfil/:id
 * @description Obter perfil do usuário autenticado
 * @params { id }
 * @returns { id, name, email }
 */
router.get("/auth/perfil/:id", UsuarioController.obterPerfil);

// ==========================================
// 💰 ROTAS DE TRANSAÇÕES
// ==========================================

/**
 * @GET /api/v1/transacoes/usuario/:usuarioId
 * @description Listar todas as transações de um usuário
 * @params { usuarioId }
 * @returns [ { id, usuario_id, date, description, category, amount, type, dataCriacao } ]
 */
router.get(
  "/transacoes/usuario/:usuarioId",
  TransacaoController.listarPorUsuario
);

/**
 * @GET /api/v1/transacoes/:id
 * @description Obter uma transação específica por ID
 * @params { id }
 * @returns { id, usuario_id, date, description, category, amount, type }
 */
router.get("/transacoes/:id", TransacaoController.obter);

/**
 * @POST /api/v1/transacoes
 * @description Criar nova transação
 * @body { usuario_id, date, description, category, amount, type }
 * @returns { mensagem, transacao: { id, usuario_id, date, ... } }
 */
router.post("/transacoes", TransacaoController.criar);

/**
 * @PUT /api/v1/transacoes/:id
 * @description Atualizar uma transação
 * @params { id }
 * @body { date, description, category, amount, type }
 * @returns { mensagem }
 */
router.put("/transacoes/:id", TransacaoController.atualizar);

/**
 * @DELETE /api/v1/transacoes/:id
 * @description Deletar uma transação
 * @params { id }
 * @returns { mensagem }
 */
router.delete("/transacoes/:id", TransacaoController.deletar);

// ==========================================
// 📊 ROTAS DE FILTROS E RELATÓRIOS
// ==========================================

/**
 * @GET /api/v1/transacoes/filtro/mes/:usuarioId/:mes/:ano
 * @description Listar transações filtradas por mês e ano
 * @params { usuarioId, mes, ano }
 * @returns [ { id, date, description, category, amount, type } ]
 */
router.get(
  "/transacoes/filtro/mes/:usuarioId/:mes/:ano",
  TransacaoController.buscarPorMes
);

/**
 * @GET /api/v1/transacoes/resumo/:usuarioId
 * @description Obter resumo financeiro do usuário
 * @params { usuarioId }
 * @returns { totalReceitas, totalDespesas, saldo, totalTransacoes }
 */
router.get("/transacoes/resumo/:usuarioId", TransacaoController.obterResumo);

/**
 * @GET /api/v1/transacoes/filtro/categoria/:usuarioId/:categoria
 * @description Listar transações filtradas por categoria
 * @params { usuarioId, categoria }
 * @returns [ { id, date, description, category, amount, type } ]
 */
router.get(
  "/transacoes/filtro/categoria/:usuarioId/:categoria",
  TransacaoController.buscarPorCategoria
);

/**
 * @GET /api/v1/transacoes/filtro/tipo/:usuarioId/:tipo
 * @description Listar transações filtradas por tipo (entrada/saída)
 * @params { usuarioId, tipo }
 * @returns [ { id, date, description, category, amount, type } ]
 */
router.get(
  "/transacoes/filtro/tipo/:usuarioId/:tipo",
  TransacaoController.buscarPorTipo
);

// ==========================================
// 📈 ROTAS DE ESTATÍSTICAS E GRÁFICOS
// ==========================================

/**
 * @GET /api/v1/estatisticas/resumo-mensal/:usuarioId/:mes/:ano
 * @description Obter resumo mensal (entradas, saídas, saldo)
 * @params { usuarioId, mes, ano }
 * @returns { mes, ano, totalEntradas, totalSaidas, saldo, quantidadeTransacoes }
 */
router.get(
  "/estatisticas/resumo-mensal/:usuarioId/:mes/:ano",
  TransacaoController.resumoMensal
);

/**
 * @GET /api/v1/estatisticas/resumo-anual/:usuarioId/:ano
 * @description Obter resumo anual com dados por mês
 * @params { usuarioId, ano }
 * @returns { ano, meses: [ { mes, totalEntradas, totalSaidas, saldo } ], totalAnual }
 */
router.get(
  "/estatisticas/resumo-anual/:usuarioId/:ano",
  TransacaoController.resumoAnual
);

/**
 * @GET /api/v1/estatisticas/categorias/:usuarioId
 * @description Obter gastos por categoria (para gráfico doughnut)
 * @params { usuarioId }
 * @returns [ { categoria, total, percentual } ]
 */
router.get(
  "/estatisticas/categorias/:usuarioId",
  TransacaoController.gastosPorCategoria
);

/**
 * @GET /api/v1/estatisticas/evolucao/:usuarioId
 * @description Obter evolução do saldo ao longo do tempo (para gráfico de linha)
 * @params { usuarioId }
 * @returns [ { data, saldoAcumulado } ]
 */
router.get(
  "/estatisticas/evolucao/:usuarioId",
  TransacaoController.evolucaoSaldo
);

// ==========================================
// 🏥 ROTAS DE HEALTH CHECK
// ==========================================

/**
 * @GET /api/v1/health
 * @description Verificar se a API está funcionando
 * @returns { status: "OK", timestamp }
 */
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "API de Controle Financeiro está online!",
  });
});

module.exports = router;
