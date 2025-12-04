// Estado global
let transactions = [];
let filters = { month: "todos", type: "todos" };
let charts = {};
let usuarioLogado = null;

// Utilitárias
function currency(n) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function fmtDate(iso) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function monthKey(iso) {
  return iso.substring(0, 7); // YYYY-MM
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  const date = new Date(year, month - 1);
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");
}

// Carregar usuário do localStorage
function loadUsuarioLogado() {
  const usuarioJSON = localStorage.getItem("usuario");
  if (usuarioJSON) {
    usuarioLogado = JSON.parse(usuarioJSON);
  }
}

// Persistência - Usar apenas Banco de Dados (MySQL)
function saveTransactions() {
  // Não salva mais no localStorage, tudo vai pro MySQL
  // Implementar endpoint POST para salvar no banco
}

async function loadTransactions() {
  if (usuarioLogado && usuarioLogado.id) {
    try {
      const response = await fetch(`/transacoes/usuario/${usuarioLogado.id}`);
      const data = await response.json();
      transactions = data || [];
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      transactions = [];
    }
  }
}

// Renderização
function renderTable() {
  const tbody = document.getElementById("transactions-body");
  tbody.innerHTML = "";
  const filtered = transactions
    .filter((t) => {
      const monthMatch =
        filters.month === "todos" || monthKey(t.date) === filters.month;
      const typeMatch = filters.type === "todos" || t.type === filters.type;
      return monthMatch && typeMatch;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-state"><td colspan="6">Nenhuma transação encontrada com os filtros aplicados.</td></tr>';
    return;
  }

  filtered.forEach((t) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${fmtDate(t.date)}</td>
            <td>${t.description || t.desc}</td>
            <td>${t.category}</td>
            <td><span class="tag tag-${t.type}">${
      t.type === "entrada" ? "Entrada" : "Saída"
    }</span></td>
            <td>${currency(t.amount)}</td>
            <td><button class="btn-remove" data-id="${
              t.id
            }">Remover</button></td>
        `;
    tbody.appendChild(row);
  });
}

function renderTotals() {
  const filtered = transactions.filter((t) => {
    const monthMatch =
      filters.month === "todos" || monthKey(t.date) === filters.month;
    const typeMatch = filters.type === "todos" || t.type === filters.type;
    return monthMatch && typeMatch;
  });

  const entradas = filtered
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);
  const saidas = filtered
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = entradas - saidas;

  document.getElementById("total-entradas").textContent = currency(entradas);
  document.getElementById("total-saidas").textContent = currency(saidas);
  document.getElementById("total-saldo").textContent = currency(saldo);
}

function renderMonthFilter() {
  const select = document.getElementById("filter-month");
  const months = [...new Set(transactions.map((t) => monthKey(t.date)))].sort();
  select.innerHTML = '<option value="todos">Todos</option>';
  months.forEach((m) => {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = monthLabel(m);
    select.appendChild(option);
  });
  select.value = filters.month;
}

function renderCharts() {
  const filtered = transactions
    .filter((t) => {
      const monthMatch =
        filters.month === "todos" || monthKey(t.date) === filters.month;
      const typeMatch = filters.type === "todos" || t.type === filters.type;
      return monthMatch && typeMatch;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Gráfico de barras mensais
  const monthlyData = {};
  filtered.forEach((t) => {
    const key = monthKey(t.date);
    if (!monthlyData[key]) monthlyData[key] = { entradas: 0, saidas: 0 };
    if (t.type === "entrada") monthlyData[key].entradas += t.amount;
    else monthlyData[key].saidas += t.amount;
  });
  const labels = Object.keys(monthlyData).sort();
  const entradasData = labels.map((l) => monthlyData[l].entradas);
  const saidasData = labels.map((l) => monthlyData[l].saidas);

  if (charts.monthly) charts.monthly.destroy();
  charts.monthly = new Chart(document.getElementById("monthly-chart"), {
    type: "bar",
    data: {
      labels: labels.map(monthLabel),
      datasets: [
        { label: "Entradas", data: entradasData, backgroundColor: "#56d364" },
        { label: "Saídas", data: saidasData, backgroundColor: "#f85149" },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => currency(v) } },
      },
    },
  });

  // Gráfico doughnut categorias
  const categoryData = {};
  filtered.forEach((t) => {
    if (!categoryData[t.category]) categoryData[t.category] = 0;
    categoryData[t.category] += t.amount;
  });
  const catLabels = Object.keys(categoryData);
  const catData = catLabels.map((c) => categoryData[c]);

  if (charts.category) charts.category.destroy();
  charts.category = new Chart(document.getElementById("category-chart"), {
    type: "doughnut",
    data: {
      labels: catLabels,
      datasets: [
        {
          data: catData,
          backgroundColor: [
            "#58a6ff",
            "#56d364",
            "#f85149",
            "#d29922",
            "#bc8cff",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
    },
  });

  // Gráfico de linha saldo acumulado
  let balance = 0;
  const balanceData = [];
  const balanceLabels = [];
  filtered.forEach((t) => {
    if (t.type === "entrada") balance += t.amount;
    else balance -= t.amount;
    balanceData.push(balance);
    balanceLabels.push(fmtDate(t.date));
  });

  if (charts.balance) charts.balance.destroy();
  charts.balance = new Chart(document.getElementById("balance-chart"), {
    type: "line",
    data: {
      labels: balanceLabels,
      datasets: [
        {
          label: "Saldo Acumulado",
          data: balanceData,
          borderColor: "#58a6ff",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { ticks: { callback: (v) => currency(v) } } },
    },
  });
}

// Eventos
document
  .getElementById("transaction-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const desc = document.getElementById("desc").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (!date || !desc || !category || isNaN(amount) || amount < 0) {
      document.getElementById("form-error").textContent =
        "Preencha todos os campos corretamente.";
      document.getElementById("form-error").style.display = "block";
      return;
    }

    // Salvar no MySQL
    try {
      const response = await fetch("/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          date,
          description: desc,
          category,
          amount,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensagem de sucesso
        const successMsg = document.createElement("div");
        successMsg.className = "success-message";
        successMsg.textContent = "✓ Transação salva com sucesso!";
        successMsg.style.cssText = `
          background-color: #56d364;
          color: white;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: bold;
        `;
        this.parentElement.insertBefore(successMsg, this);

        // Remover mensagem após 3 segundos
        setTimeout(() => successMsg.remove(), 3000);

        // Recarregar transações
        await loadTransactions();
        renderAll();
        this.reset();
        document.getElementById("form-error").style.display = "none";
      } else {
        document.getElementById("form-error").textContent =
          data.erro || "Erro ao salvar transação";
        document.getElementById("form-error").style.display = "block";
      }
    } catch (error) {
      console.error("Erro:", error);
      document.getElementById("form-error").textContent =
        "Erro ao conectar com o servidor";
      document.getElementById("form-error").style.display = "block";
    }
  });

document.getElementById("clear-all").addEventListener("click", function () {
  if (confirm("Tem certeza que deseja apagar todas as transações?")) {
    transactions = [];
    saveTransactions();
    renderAll();
  }
});

document
  .getElementById("transactions-body")
  .addEventListener("click", async function (e) {
    if (e.target.classList.contains("btn-remove")) {
      const id = parseInt(e.target.dataset.id);

      if (!confirm("Tem certeza que deseja remover esta transação?")) {
        return;
      }

      try {
        const response = await fetch(`/transacoes/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (response.ok) {
          // Recarregar transações
          await loadTransactions();
          renderAll();
        } else {
          alert(data.erro || "Erro ao remover transação");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor");
      }
    }
  });

document.getElementById("filter-month").addEventListener("change", function () {
  filters.month = this.value;
  renderAll();
});

document.getElementById("filter-type").addEventListener("change", function () {
  filters.type = this.value;
  renderAll();
});

// Inicialização
function renderAll() {
  renderTable();
  renderTotals();
  renderMonthFilter();
  renderCharts();
}
// Inicializar
async function init() {
  loadUsuarioLogado();
  await loadTransactions();
  renderAll();
}

init();

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }
});

// Função para gerar PDF do mês
function generatePDFMonth() {
  if (!usuarioLogado) {
    alert("Usuário não identificado. Faça login novamente.");
    return;
  }

  const now = new Date();
  const mes = (now.getMonth() + 1).toString().padStart(2, "0");
  const ano = now.getFullYear();

  const currentMonth = now.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  fetch(`/transacoes/mes/${usuarioLogado.id}/${mes}/${ano}`)
    .then((response) => response.json())
    .then((filteredTransactions) => {
      const totalEntradas = parseFloat(
        filteredTransactions
          .filter((t) => t.type === "entrada")
          .reduce((sum, t) => sum + t.amount, 0)
      ).toFixed(2);
      const totalSaidas = parseFloat(
        filteredTransactions
          .filter((t) => t.type === "saída")
          .reduce((sum, t) => sum + t.amount, 0)
      ).toFixed(2);
      const saldo = (totalEntradas - totalSaidas).toFixed(2);
      const entradaCount = filteredTransactions.filter(
        (t) => t.type === "entrada"
      ).length;
      const saidaCount = filteredTransactions.filter(
        (t) => t.type === "saída"
      ).length;

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório ${currentMonth}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;padding:20px}.container{max-width:900px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.header{background:linear-gradient(135deg,#0d1117 0%,#1c2128 100%);color:white;padding:40px;text-align:center;position:relative}.header::before{content:'';position:absolute;top:0;right:0;width:200px;height:200px;background:rgba(88,166,255,.1);border-radius:50%;transform:translate(50%,-50%)}.header h1{font-size:32px;margin-bottom:5px;position:relative;z-index:1}.header p{font-size:16px;opacity:.9;position:relative;z-index:1}.user-section{background:#f8f9fa;padding:20px 40px;border-bottom:2px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center}.user-info{flex:1}.user-info p{margin:5px 0;color:#333;font-size:14px}.user-info strong{color:#0d1117;font-weight:600}.date-badge{background:linear-gradient(135deg,#58a6ff 0%,#3b82f6 100%);color:white;padding:12px 20px;border-radius:25px;font-weight:600;font-size:14px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0;background:white}.stat-card{padding:30px;text-align:center;border-right:1px solid #e0e0e0}.stat-card:last-child{border-right:none}.stat-label{font-size:12px;color:#666;text-transform:uppercase;font-weight:600;letter-spacing:1px;margin-bottom:10px}.stat-value{font-size:28px;font-weight:700}.entrada-value{color:#56d364}.saida-value{color:#f85149}.saldo-value{color:#0d1117}.transacoes-section{padding:40px}.section-title{font-size:18px;font-weight:600;color:#0d1117;margin-bottom:20px;border-bottom:3px solid #58a6ff;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin-bottom:30px}thead{background:#f8f9fa}th{padding:15px;text-align:left;font-weight:600;color:#0d1117;font-size:13px;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e0e0e0}td{padding:15px;border-bottom:1px solid #e0e0e0;font-size:14px}tbody tr:hover{background:#f8f9fa}tbody tr:last-child td{border-bottom:none}.tipo-entrada{color:#56d364;font-weight:600}.tipo-saida{color:#f85149;font-weight:600}.empty-state{text-align:center;padding:40px;color:#666}.empty-state-icon{font-size:48px;margin-bottom:10px}.footer{background:#f8f9fa;padding:20px 40px;border-top:2px solid #e0e0e0;text-align:center;color:#666;font-size:12px}.footer-line{border-top:1px solid #ccc;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>📊 Relatório Financeiro</h1><p>Extrato detalhado de transações</p></div><div class="user-section"><div class="user-info"><p><strong>Usuário:</strong> ${
        usuarioLogado.name
      }</p><p><strong>Email:</strong> ${
        usuarioLogado.email
      }</p></div><div class="date-badge">${currentMonth}</div></div><div class="stats"><div class="stat-card"><div class="stat-label\">💰 Entradas</div><div class="stat-value entrada-value">R$ ${totalEntradas.replace(
        ".",
        ","
      )}</div><div class="stat-label" style="margin-top:8px;color:#999">${entradaCount} transação${
        entradaCount !== 1 ? "s" : ""
      }</div></div><div class="stat-card"><div class="stat-label">📉 Saídas</div><div class="stat-value saida-value">R$ ${totalSaidas.replace(
        ".",
        ","
      )}</div><div class="stat-label" style="margin-top:8px;color:#999">${saidaCount} transação${
        saidaCount !== 1 ? "s" : ""
      }</div></div><div class="stat-card"><div class="stat-label">⚖️ Saldo</div><div class="stat-value saldo-value">R$ ${saldo.replace(
        ".",
        ","
      )}</div><div class="stat-label" style="margin-top:8px;color:${
        saldo >= 0 ? "#56d364" : "#f85149"
      }">${
        saldo >= 0 ? "✓ Positivo" : "✗ Negativo"
      }</div></div></div><div class="transacoes-section"><div class="section-title">📝 Detalhes das Transações</div>${
        filteredTransactions.length > 0
          ? `<table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th style="text-align:right">Valor</th></tr></thead><tbody>${filteredTransactions
              .map(
                (t) =>
                  `<tr><td><strong>${fmtDate(t.date)}</strong></td><td>${
                    t.description || t.desc || "N/A"
                  }</td><td>${t.category || "N/A"}</td><td><span class="${
                    t.type === "entrada" ? "tipo-entrada" : "tipo-saida"
                  }">${
                    t.type === "entrada" ? "Entrada" : "Saída"
                  }</span></td><td style="text-align:right;${
                    t.type === "entrada" ? "color:#56d364;" : "color:#f85149;"
                  };font-weight:600">+ R$ ${parseFloat(t.amount)
                    .toFixed(2)
                    .replace(".", ",")}</td></tr>`
              )
              .join("")}</tbody></table>`
          : `<div class="empty-state"><div class="empty-state-icon">📭</div><p>Nenhuma transação registrada neste mês</p></div>`
      }</div><div class="footer"><p>Relatório gerado automaticamente pelo Sistema de Controle Financeiro</p><p>Data: ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString(
        "pt-BR"
      )}</p><div class="footer-line"></div><p style="font-size:11px;color:#999">Documento gerado automaticamente.</p></div></div></body></html>`;

      const opt = {
        margin: 0,
        filename: `relatorio_mes_${usuarioLogado.id}_${mes}_${ano}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(html).save();
    })
    .catch((err) => {
      console.error("Erro ao buscar transações:", err);
      alert("Erro ao gerar relatório. Verifique o console.");
    });
}

// Função para gerar PDF anual
function generatePDFYear() {
  if (!usuarioLogado) {
    alert("Usuário não identificado. Faça login novamente.");
    return;
  }

  const currentYear = new Date().getFullYear();

  fetch(`/transacoes/usuario/${usuarioLogado.id}`)
    .then((response) => response.json())
    .then((transacoes) => {
      const transacoesDaAno = transacoes.filter((t) => {
        const ano = new Date(t.date).getFullYear();
        return ano === currentYear;
      });

      const totalEntradas = parseFloat(
        transacoesDaAno
          .filter((t) => t.type === "entrada")
          .reduce((sum, t) => sum + t.amount, 0)
      ).toFixed(2);
      const totalSaidas = parseFloat(
        transacoesDaAno
          .filter((t) => t.type === "saída")
          .reduce((sum, t) => sum + t.amount, 0)
      ).toFixed(2);
      const saldo = (totalEntradas - totalSaidas).toFixed(2);

      const monthlyCardsHTML = generateMonthlyCardsHTML(transacoesDaAno);

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório Anual ${currentYear}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;padding:20px}.container{max-width:900px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.header{background:linear-gradient(135deg,#0d1117 0%,#1c2128 100%);color:white;padding:40px;text-align:center;position:relative}.header::before{content:'';position:absolute;top:0;right:0;width:200px;height:200px;background:rgba(86,211,100,.1);border-radius:50%;transform:translate(50%,-50%)}.header h1{font-size:32px;margin-bottom:5px;position:relative;z-index:1}.header p{font-size:16px;opacity:.9;position:relative;z-index:1}.user-section{background:#f8f9fa;padding:20px 40px;border-bottom:2px solid #e0e0e0}.user-info p{margin:5px 0;color:#333;font-size:14px}.user-info strong{color:#0d1117;font-weight:600}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0;background:white}.stat-card{padding:30px;text-align:center;border-right:1px solid #e0e0e0}.stat-card:last-child{border-right:none}.stat-label{font-size:12px;color:#666;text-transform:uppercase;font-weight:600;letter-spacing:1px;margin-bottom:10px}.stat-value{font-size:28px;font-weight:700}.entrada-value{color:#56d364}.saida-value{color:#f85149}.saldo-value{color:#0d1117}.content{padding:40px}.section-title{font-size:18px;font-weight:600;color:#0d1117;margin:30px 0 20px 0;border-bottom:3px solid #58a6ff;padding-bottom:10px}.monthly-summary{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:20px}.month-card{background:#f8f9fa;padding:15px;border-radius:8px;border-left:4px solid #58a6ff}.month-name{font-size:14px;font-weight:600;color:#0d1117;margin-bottom:10px}.month-values{display:flex;justify-content:space-between;font-size:13px}.footer{background:#f8f9fa;padding:20px 40px;border-top:2px solid #e0e0e0;text-align:center;color:#666;font-size:12px}.footer-line{border-top:1px solid #ccc;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>📅 Relatório Anual</h1><p>Análise financeira completa - ${currentYear}</p></div><div class="user-section"><div class="user-info"><p><strong>Usuário:</strong> ${
        usuarioLogado.name
      }</p><p><strong>Email:</strong> ${
        usuarioLogado.email
      }</p><p><strong>Período:</strong> 01/01/${currentYear} - 31/12/${currentYear}</p></div></div><div class="stats"><div class="stat-card"><div class="stat-label">💰 Total de Entradas</div><div class="stat-value entrada-value">R$ ${totalEntradas.replace(
        ".",
        ","
      )}</div></div><div class="stat-card"><div class="stat-label">📉 Total de Saídas</div><div class="stat-value saida-value">R$ ${totalSaidas.replace(
        ".",
        ","
      )}</div></div><div class="stat-card"><div class="stat-label">⚖️ Saldo Anual</div><div class="stat-value saldo-value">R$ ${saldo.replace(
        ".",
        ","
      )}</div></div></div><div class="content"><div class="section-title">📊 Resumo Mensal</div><div class="monthly-summary">${monthlyCardsHTML}</div></div><div class="footer"><p>Relatório Anual gerado automaticamente pelo Sistema de Controle Financeiro</p><p>Data: ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString(
        "pt-BR"
      )}</p><div class="footer-line"></div><p style="font-size:11px;color:#999">Documento gerado automaticamente.</p></div></div></body></html>`;

      const opt = {
        margin: 0,
        filename: `relatorio_anual_${usuarioLogado.id}_${currentYear}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(html).save();
    })
    .catch((err) => {
      console.error("Erro ao buscar transações:", err);
      alert("Erro ao gerar relatório anual. Verifique o console.");
    });
}

// Função auxiliar para gerar cards mensais no PDF anual
function generateMonthlyCardsHTML(trans) {
  const months = {};

  trans.forEach((t) => {
    const mKey = t.date.substring(0, 7);
    if (!months[mKey]) {
      months[mKey] = [];
    }
    months[mKey].push(t);
  });

  return Object.keys(months)
    .sort()
    .map((month) => {
      const monthTrans = months[month];
      const monthLbl = monthLabel(month);
      const entrada = monthTrans
        .filter((t) => t.type === "entrada")
        .reduce((sum, t) => sum + t.amount, 0);
      const saida = monthTrans
        .filter((t) => t.type === "saída")
        .reduce((sum, t) => sum + t.amount, 0);

      return `<div class="month-card"><div class="month-name">${monthLbl}</div><div class="month-values"><span style="color:#56d364">+R$ ${parseFloat(
        entrada
      )
        .toFixed(2)
        .replace(".", ",")}</span><span style="color:#f85149">-R$ ${parseFloat(
        saida
      )
        .toFixed(2)
        .replace(".", ",")}</span></div></div>`;
    })
    .join("");
}
