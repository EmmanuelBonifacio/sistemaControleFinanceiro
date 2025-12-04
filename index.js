const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");

// Middleware para fazer parsing de JSON
app.use(express.json());
app.use(express.static("."));

// GET - Página de login
app.get("/login", (req, res) => {
  res.sendFile("paginaLogin.html", { root: __dirname });
});

// POST - Realizar login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  const query = "SELECT * FROM usuarios WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const usuario = results[0];
    res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: { id: usuario.id, email: usuario.email, name: usuario.name },
    });
  });
});

// POST - Cadastro de novo usuário
app.post("/cadastro", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ erro: "Nome, email e senha são obrigatórios" });
  }

  // Inserir no MySQL
  const query = "INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)";

  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      return res.status(400).json({ erro: "Email já existe" });
    }
    res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
  });
});

// GET - Página inicial (redireciona para login ou principal)
app.get("/", (req, res) => {
  res.sendFile("paginaLogin.html", { root: __dirname });
});

// GET - Página principal após login
app.get("/principal", (req, res) => {
  res.sendFile("paginaPrincipal.html", { root: __dirname });
});

// GET - Listar transações do usuário do banco de dados
app.get("/transacoes/usuario/:usuarioId", (req, res) => {
  const { usuarioId } = req.params;

  const query =
    "SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY date DESC";

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar transações" });
    }
    res.json(results);
  });
});

// GET - Listar todas as transações (em memória - manter compatibilidade)
app.get("/transacoes", (req, res) => {
  res.json(transacoes);
});

// POST - Criar nova transação no MySQL
app.post("/transacoes", (req, res) => {
  const { usuario_id, date, description, category, amount, type } = req.body;

  if (!usuario_id || !date || !description || !category || !amount || !type) {
    return res.status(400).json({ erro: "Faltam dados obrigatórios" });
  }

  const query =
    "INSERT INTO transacoes (usuario_id, date, description, category, amount, type) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [usuario_id, date, description, category, parseFloat(amount), type],
    (err, result) => {
      if (err) {
        console.error("Erro ao inserir transação:", err);
        return res.status(500).json({ erro: "Erro ao salvar transação" });
      }
      res.status(201).json({
        mensagem: "Transação criada!",
        transacao: {
          id: result.insertId,
          usuario_id,
          date,
          description,
          category,
          amount: parseFloat(amount),
          type,
        },
      });
    }
  );
});

// GET - Obter transação por ID
app.get("/transacoes/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM transacoes WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar transação" });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: "Transação não encontrada" });
    }

    res.json(results[0]);
  });
});

// PUT - Atualizar transação
app.put("/transacoes/:id", (req, res) => {
  const { id } = req.params;
  const { date, description, category, amount, type } = req.body;

  const query =
    "UPDATE transacoes SET date = ?, description = ?, category = ?, amount = ?, type = ? WHERE id = ?";

  db.query(
    query,
    [date, description, category, parseFloat(amount), type, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao atualizar transação" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Transação não encontrada" });
      }

      res.json({ mensagem: "Transação atualizada!" });
    }
  );
});

// DELETE - Deletar transação
app.delete("/transacoes/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM transacoes WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao deletar transação" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Transação não encontrada" });
    }

    res.json({ mensagem: "Transação deletada!" });
  });
});

// GET - Resumo das transações
app.get("/resumo", (req, res) => {
  const query =
    'SELECT SUM(CASE WHEN type = "entrada" THEN amount ELSE 0 END) as receitas, SUM(CASE WHEN type = "saída" THEN amount ELSE 0 END) as despesas, COUNT(*) as total FROM transacoes';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao calcular resumo" });
    }

    const receitas = results[0].receitas || 0;
    const despesas = results[0].despesas || 0;
    const saldo = receitas - despesas;

    res.json({
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: saldo,
      totalTransacoes: results[0].total,
    });
  });
});

// GET - Transações filtradas por mês/ano
app.get("/transacoes/mes/:usuarioId/:mes/:ano", (req, res) => {
  const { usuarioId, mes, ano } = req.params;
  const mesAno = `${ano}-${mes.padStart(2, "0")}`;

  const query = `
    SELECT * FROM transacoes 
    WHERE usuario_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    ORDER BY date DESC
  `;

  db.query(query, [usuarioId, mesAno], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar transações" });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log("servidor iniciado na porta 3000: http://localhost:3000");
});
