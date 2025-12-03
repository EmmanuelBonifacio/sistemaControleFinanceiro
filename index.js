const express = require("express");
const app = express();
const port = 3000;

// Middleware para fazer parsing de JSON
app.use(express.json());
app.use(express.static("."));

// Array para armazenar transações (em memória)
let transacoes = [];

// GET - Página principal
app.get("/", (req, res) => {
  res.sendFile("paginaPrincipal.html", { root: __dirname });
});

// GET - Listar todas as transações
app.get("/transacoes", (req, res) => {
  res.json(transacoes);
});

// POST - Criar nova transação
app.post("/transacoes", (req, res) => {
  const { date, desc, category, amount, type } = req.body;

  if (!date || !desc || !category || !amount || !type) {
    return res.status(400).json({ erro: "Faltam dados obrigatórios" });
  }

  const novaTransacao = {
    id: transacoes.length + 1,
    date,
    desc,
    category,
    amount: parseFloat(amount),
    type,
    dataCriacao: new Date(),
  };

  transacoes.push(novaTransacao);
  res
    .status(201)
    .json({ mensagem: "Transação criada!", transacao: novaTransacao });
});

// GET - Obter transação por ID
app.get("/transacoes/:id", (req, res) => {
  const { id } = req.params;
  const transacao = transacoes.find((t) => t.id == id);

  if (!transacao) {
    return res.status(404).json({ erro: "Transação não encontrada" });
  }

  res.json(transacao);
});

// PUT - Atualizar transação
app.put("/transacoes/:id", (req, res) => {
  const { id } = req.params;
  const transacao = transacoes.find((t) => t.id == id);

  if (!transacao) {
    return res.status(404).json({ erro: "Transação não encontrada" });
  }

  Object.assign(transacao, req.body);
  res.json({ mensagem: "Transação atualizada!", transacao });
});

// DELETE - Deletar transação
app.delete("/transacoes/:id", (req, res) => {
  const { id } = req.params;
  const index = transacoes.findIndex((t) => t.id == id);

  if (index === -1) {
    return res.status(404).json({ erro: "Transação não encontrada" });
  }

  const transacaoDeletada = transacoes.splice(index, 1);
  res.json({
    mensagem: "Transação deletada!",
    transacao: transacaoDeletada[0],
  });
});

// GET - Resumo das transações
app.get("/resumo", (req, res) => {
  const receitas = transacoes
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = transacoes
    .filter((t) => t.type === "saída")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = receitas - despesas;

  res.json({
    totalReceitas: receitas,
    totalDespesas: despesas,
    saldo: saldo,
    totalTransacoes: transacoes.length,
  });
});

app.listen(port, () => {
  console.log("servidor iniciado na porta 3000: http://localhost:3000");
});
