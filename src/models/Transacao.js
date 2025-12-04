const db = require("../../db");

class Transacao {
  // Buscar todas as transações de um usuário
  static buscarPorUsuario(usuarioId, callback) {
    const query =
      "SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY date DESC";
    db.query(query, [usuarioId], callback);
  }

  // Buscar transação por ID
  static buscarPorId(id, callback) {
    const query = "SELECT * FROM transacoes WHERE id = ?";
    db.query(query, [id], callback);
  }

  // Criar nova transação
  static criar(
    usuario_id,
    date,
    description,
    category,
    amount,
    type,
    callback
  ) {
    const query =
      "INSERT INTO transacoes (usuario_id, date, description, category, amount, type) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [usuario_id, date, description, category, parseFloat(amount), type],
      callback
    );
  }

  // Atualizar transação
  static atualizar(id, date, description, category, amount, type, callback) {
    const query =
      "UPDATE transacoes SET date = ?, description = ?, category = ?, amount = ?, type = ? WHERE id = ?";
    db.query(
      query,
      [date, description, category, parseFloat(amount), type, id],
      callback
    );
  }

  // Deletar transação
  static deletar(id, callback) {
    const query = "DELETE FROM transacoes WHERE id = ?";
    db.query(query, [id], callback);
  }

  // Buscar transações por mês/ano
  static buscarPorMes(usuarioId, mes, ano, callback) {
    const mesAno = `${ano}-${mes.padStart(2, "0")}`;
    const query = `
      SELECT * FROM transacoes 
      WHERE usuario_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
      ORDER BY date DESC
    `;
    db.query(query, [usuarioId, mesAno], callback);
  }

  // Calcular resumo (total de entradas, saídas e saldo)
  static calcularResumo(usuarioId, callback) {
    const query = `
      SELECT 
        SUM(CASE WHEN type = "entrada" THEN amount ELSE 0 END) as receitas, 
        SUM(CASE WHEN type = "saída" THEN amount ELSE 0 END) as despesas, 
        COUNT(*) as total 
      FROM transacoes 
      WHERE usuario_id = ?
    `;
    db.query(query, [usuarioId], callback);
  }
}

module.exports = Transacao;
