// ==========================================
// 🔐 Carregar variáveis de ambiente
// ==========================================
require("dotenv").config();

// Verificar se JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  AVISO: JWT_SECRET não definido no .env");
}

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Importar rotas
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const transacaoRoutes = require("./src/routes/transacaoRoutes");
const apiRoutes = require("./src/routes/apiRoutes");

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.static(".")); // Serve arquivos estáticos

// ==========================================
// 🔐 ROTAS LEGADAS (Compatibilidade)
// ==========================================
app.use("/", usuarioRoutes);
app.use("/transacoes", transacaoRoutes);

// ==========================================
// 🔌 NOVA API REST v1
// ==========================================
app.use("/api/v1", apiRoutes);

// Página de login
app.get("/login", (req, res) => {
  res.sendFile("paginaLogin.html", { root: __dirname });
});

// Página principal
app.get("/principal", (req, res) => {
  res.sendFile("paginaPrincipal.html", { root: __dirname });
});

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile("paginaLogin.html", { root: __dirname });
});

// ==========================================
// 📚 DOCUMENTAÇÃO DA API
// ==========================================
app.get("/api/docs", (req, res) => {
  res.json({
    api: "Sistema de Controle Financeiro",
    versao: "1.0.0",
    baseUrl: "http://localhost:3000/api/v1",
    endpoints: {
      autenticacao: {
        "POST /auth/cadastro": "Registrar novo usuário",
        "POST /auth/login": "Fazer login",
        "GET /auth/perfil/:id": "Obter perfil do usuário",
      },
      transacoes: {
        "GET /transacoes/usuario/:usuarioId": "Listar todas as transações",
        "GET /transacoes/:id": "Obter uma transação",
        "POST /transacoes": "Criar transação",
        "PUT /transacoes/:id": "Atualizar transação",
        "DELETE /transacoes/:id": "Deletar transação",
      },
      filtros: {
        "GET /transacoes/filtro/mes/:usuarioId/:mes/:ano": "Transações por mês",
        "GET /transacoes/filtro/categoria/:usuarioId/:categoria":
          "Transações por categoria",
        "GET /transacoes/filtro/tipo/:usuarioId/:tipo": "Transações por tipo",
      },
      estatisticas: {
        "GET /estatisticas/resumo-mensal/:usuarioId/:mes/:ano": "Resumo mensal",
        "GET /estatisticas/resumo-anual/:usuarioId/:ano": "Resumo anual",
        "GET /estatisticas/categorias/:usuarioId": "Gastos por categoria",
        "GET /estatisticas/evolucao/:usuarioId": "Evolução do saldo",
      },
      utilitarios: {
        "GET /health": "Verificar status da API",
        "GET /api/docs": "Ver documentação completa",
      },
    },
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Servidor iniciado na porta ${port}`);
  console.log(`   URL: http://localhost:${port}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Arquitetura MVC implementada com sucesso!`);
  console.log(`🔌 API REST v1 disponível em: http://localhost:${port}/api/v1`);
  console.log(`📚 Documentação em: http://localhost:${port}/api/docs`);
  console.log(`${"=".repeat(60)}\n`);
});
