const express = require("express");
const app = express();
const port = 3000;

// Importar rotas
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const transacaoRoutes = require("./src/routes/transacaoRoutes");

// Middleware
app.use(express.json());
app.use(express.static(".")); // Serve arquivos estáticos

// Rotas de autenticação (usuários)
app.use("/", usuarioRoutes);

// Rotas de transações
app.use("/transacoes", transacaoRoutes);

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

// Iniciar servidor
app.listen(port, () => {
  console.log(
    `🚀 Servidor iniciado na porta ${port}: http://localhost:${port}`
  );
  console.log("📊 Arquitetura MVC implementada com sucesso!");
});
