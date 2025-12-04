const Transacao = require("../models/Transacao");
const db = require("../../db");

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

  // GET /transacoes/filtro/categoria/:usuarioId/:categoria
  static buscarPorCategoria(req, res) {
    const { usuarioId, categoria } = req.params;

    const query = `
      SELECT * FROM transacoes 
      WHERE usuario_id = ? AND category = ?
      ORDER BY date DESC
    `;

    db.query(query, [usuarioId, categoria], (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar por categoria" });
      }
      res.json(results);
    });
  }

  // GET /transacoes/filtro/tipo/:usuarioId/:tipo
  static buscarPorTipo(req, res) {
    const { usuarioId, tipo } = req.params;
    const tipoFormatado = tipo === "entrada" ? "entrada" : "saída";

    const query = `
      SELECT * FROM transacoes 
      WHERE usuario_id = ? AND type = ?
      ORDER BY date DESC
    `;

    db.query(query, [usuarioId, tipoFormatado], (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar por tipo" });
      }
      res.json(results);
    });
  }

  // GET /estatisticas/resumo-mensal/:usuarioId/:mes/:ano
  static resumoMensal(req, res) {
    const { usuarioId, mes, ano } = req.params;
    const mesAno = `${ano}-${mes.padStart(2, "0")}`;

    const query = `
      SELECT 
        COUNT(*) as quantidadeTransacoes,
        SUM(CASE WHEN type = "entrada" THEN amount ELSE 0 END) as totalEntradas,
        SUM(CASE WHEN type = "saída" THEN amount ELSE 0 END) as totalSaidas
      FROM transacoes
      WHERE usuario_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    `;

    db.query(query, [usuarioId, mesAno], (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao calcular resumo mensal" });
      }

      const data = results[0];
      const totalEntradas = parseFloat(data.totalEntradas) || 0;
      const totalSaidas = parseFloat(data.totalSaidas) || 0;

      res.json({
        mes: parseInt(mes),
        ano: parseInt(ano),
        totalEntradas,
        totalSaidas,
        saldo: totalEntradas - totalSaidas,
        quantidadeTransacoes: data.quantidadeTransacoes,
      });
    });
  }

  // GET /estatisticas/resumo-anual/:usuarioId/:ano
  static resumoAnual(req, res) {
    const { usuarioId, ano } = req.params;

    const query = `
      SELECT 
        DATE_FORMAT(date, '%m') as mes,
        SUM(CASE WHEN type = "entrada" THEN amount ELSE 0 END) as totalEntradas,
        SUM(CASE WHEN type = "saída" THEN amount ELSE 0 END) as totalSaidas,
        COUNT(*) as quantidadeTransacoes
      FROM transacoes
      WHERE usuario_id = ? AND YEAR(date) = ?
      GROUP BY DATE_FORMAT(date, '%m')
      ORDER BY mes ASC
    `;

    db.query(query, [usuarioId, ano], (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao calcular resumo anual" });
      }

      let totalAnual = {
        entradas: 0,
        saidas: 0,
        saldo: 0,
      };

      const meses = results.map((r) => {
        const totalEntradas = parseFloat(r.totalEntradas) || 0;
        const totalSaidas = parseFloat(r.totalSaidas) || 0;
        totalAnual.entradas += totalEntradas;
        totalAnual.saidas += totalSaidas;

        return {
          mes: parseInt(r.mes),
          totalEntradas,
          totalSaidas,
          saldo: totalEntradas - totalSaidas,
          quantidadeTransacoes: r.quantidadeTransacoes,
        };
      });

      totalAnual.saldo = totalAnual.entradas - totalAnual.saidas;

      res.json({
        ano: parseInt(ano),
        meses,
        totalAnual,
      });
    });
  }

  // GET /estatisticas/categorias/:usuarioId
  static gastosPorCategoria(req, res) {
    const { usuarioId } = req.params;

    const query = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as quantidade,
        type
      FROM transacoes
      WHERE usuario_id = ?
      GROUP BY category, type
      ORDER BY total DESC
    `;

    db.query(query, [usuarioId], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ erro: "Erro ao calcular gastos por categoria" });
      }

      const categorias = results.map((r) => ({
        categoria: r.category,
        total: parseFloat(r.total) || 0,
        quantidade: r.quantidade,
        tipo: r.type,
      }));

      res.json(categorias);
    });
  }

  // GET /estatisticas/evolucao/:usuarioId
  static evolucaoSaldo(req, res) {
    const { usuarioId } = req.params;

    const query = `
      SELECT 
        date,
        CASE WHEN type = "entrada" THEN amount ELSE -amount END as valor
      FROM transacoes
      WHERE usuario_id = ?
      ORDER BY date ASC
    `;

    db.query(query, [usuarioId], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ erro: "Erro ao calcular evolução do saldo" });
      }

      let saldoAcumulado = 0;
      const evolucao = results.map((r) => {
        saldoAcumulado += parseFloat(r.valor);
        return {
          data: r.date,
          saldoAcumulado,
        };
      });

      res.json(evolucao);
    });
  }
}

module.exports = TransacaoController;
