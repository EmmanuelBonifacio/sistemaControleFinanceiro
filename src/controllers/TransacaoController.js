const Transacao = require("../models/Transacao");

class TransacaoController {
  // GET /transacoes/usuario/:usuarioId
  static listarPorUsuario(req, res) {
    const { usuarioId } = req.params;

    Transacao.buscarPorUsuario(usuarioId, (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar transações" });
      }
      res.json(results);
    });
  }

  // GET /transacoes/:id
  static obter(req, res) {
    const { id } = req.params;

    Transacao.buscarPorId(id, (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar transação" });
      }

      if (results.length === 0) {
        return res.status(404).json({ erro: "Transação não encontrada" });
      }

      res.json(results[0]);
    });
  }

  // POST /transacoes
  static criar(req, res) {
    const { usuario_id, date, description, category, amount, type } = req.body;

    if (!usuario_id || !date || !description || !category || !amount || !type) {
      return res.status(400).json({ erro: "Faltam dados obrigatórios" });
    }

    Transacao.criar(
      usuario_id,
      date,
      description,
      category,
      amount,
      type,
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
  }

  // PUT /transacoes/:id
  static atualizar(req, res) {
    const { id } = req.params;
    const { date, description, category, amount, type } = req.body;

    Transacao.atualizar(
      id,
      date,
      description,
      category,
      amount,
      type,
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
  }

  // DELETE /transacoes/:id
  static deletar(req, res) {
    const { id } = req.params;

    Transacao.deletar(id, (err, result) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao deletar transação" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Transação não encontrada" });
      }

      res.json({ mensagem: "Transação deletada!" });
    });
  }

  // GET /transacoes/mes/:usuarioId/:mes/:ano
  static buscarPorMes(req, res) {
    const { usuarioId, mes, ano } = req.params;

    Transacao.buscarPorMes(usuarioId, mes, ano, (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar transações" });
      }
      res.json(results);
    });
  }

  // GET /resumo/:usuarioId
  static obterResumo(req, res) {
    const { usuarioId } = req.params;

    Transacao.calcularResumo(usuarioId, (err, results) => {
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
  }
}

module.exports = TransacaoController;
