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
  return iso.substring(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  const date = new Date(year, month - 1);
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");
}

function loadUsuarioLogado() {
  const usuarioJSON = localStorage.getItem("usuario");
  if (usuarioJSON) {
    usuarioLogado = JSON.parse(usuarioJSON);
  }
}

function saveTransactions() {
  // Não salva mais no localStorage
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
      '<tr class="empty-state"><td colspan="6">Nenhuma transação encontrada.</td></tr>';
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
      <td><button class="btn-remove" data-id="${t.id}">Remover</button></td>
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
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const saidas = filtered
    .filter((t) => t.type === "saída")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
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
    if (t.type === "entrada") monthlyData[key].entradas += parseFloat(t.amount);
    else monthlyData[key].saidas += parseFloat(t.amount);
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
    categoryData[t.category] += parseFloat(t.amount);
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
    if (t.type === "entrada") balance += parseFloat(t.amount);
    else balance -= parseFloat(t.amount);
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

        setTimeout(() => successMsg.remove(), 3000);

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

document
  .getElementById("clear-all")
  .addEventListener("click", async function () {
    if (confirm("Tem certeza que deseja apagar todas as transações?")) {
      try {
        for (const t of transactions) {
          await fetch(`/transacoes/${t.id}`, { method: "DELETE" });
        }
        transactions = [];
        renderAll();
      } catch (error) {
        console.error("Erro ao apagar transações:", error);
        alert("Erro ao apagar transações");
      }
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

function renderAll() {
  renderTable();
  renderTotals();
  renderMonthFilter();
  renderCharts();
}

async function init() {
  loadUsuarioLogado();
  await loadTransactions();
  renderAll();
}

init();

document.getElementById("logout-btn").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }
});

// PDF COMPACTO E PROFISSIONAL
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

      const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório ${currentMonth}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
          .header { background: linear-gradient(135deg, #0d1117 0%, #1c2128 100%); color: white; padding: 15px 20px; text-align: center; }
          .header h1 { font-size: 18px; margin: 3px 0; }
          .header p { font-size: 11px; opacity: 0.9; }
          .info { background: #f0f0f0; padding: 8px 15px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; font-size: 9px; }
          .stats { display: flex; margin: 0; background: white; }
          .stat { flex: 1; padding: 10px; border-right: 1px solid #ddd; text-align: center; }
          .stat:last-child { border-right: none; }
          .stat-label { font-size: 8px; color: #666; font-weight: bold; text-transform: uppercase; }
          .stat-value { font-size: 14px; font-weight: bold; margin: 3px 0; }
          .entrada { color: #56d364; }
          .saida { color: #f85149; }
          .saldo { color: #0d1117; }
          .section { margin-top: 10px; padding: 0 10px; }
          .section-title { font-size: 11px; font-weight: bold; color: #0d1117; border-bottom: 2px solid #58a6ff; padding-bottom: 3px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th { background: #f0f0f0; padding: 5px 4px; text-align: left; border-bottom: 1px solid #ccc; font-weight: bold; }
          td { padding: 5px 4px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #fafafa; }
          .footer { text-align: center; font-size: 8px; color: #999; margin-top: 10px; padding: 8px; border-top: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório - ${currentMonth}</h1>
          <p>Extrato de Transações</p>
        </div>
        <div class="info">
          <span><strong>Usuário:</strong> ${usuarioLogado.name}</span>
          <span><strong>Email:</strong> ${usuarioLogado.email}</span>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-label">Entradas</div>
            <div class="stat-value entrada">R$ ${totalEntradas.replace(
              ".",
              ","
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Saídas</div>
            <div class="stat-value saida">R$ ${totalSaidas.replace(
              ".",
              ","
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Saldo</div>
            <div class="stat-value saldo">R$ ${saldo.replace(".", ",")}</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Transações</div>
          ${
            filteredTransactions.length > 0
              ? `<table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Tipo</th>
                      <th style="text-align: right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredTransactions
                      .map(
                        (t) => `<tr>
                      <td>${fmtDate(t.date)}</td>
                      <td>${t.description || t.desc || "N/A"}</td>
                      <td>${t.category || "N/A"}</td>
                      <td>${t.type === "entrada" ? "Ent" : "Saí"}</td>
                      <td style="text-align: right; color: ${
                        t.type === "entrada" ? "#56d364" : "#f85149"
                      }">R$ ${parseFloat(t.amount)
                          .toFixed(2)
                          .replace(".", ",")}</td>
                    </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>`
              : `<p style="text-align: center; color: #999; padding: 10px;">Nenhuma transação</p>`
          }
        </div>
        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </body>
      </html>`;

      const opt = {
        margin: 3,
        filename: `relatorio_mes_${usuarioLogado.id}_${mes}_${ano}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 1.2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(html).save();
    })
    .catch((err) => {
      console.error("Erro:", err);
      alert("Erro ao gerar relatório");
    });
}

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

      const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Anual ${currentYear}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
          .header { background: linear-gradient(135deg, #0d1117 0%, #1c2128 100%); color: white; padding: 15px 20px; text-align: center; }
          .header h1 { font-size: 18px; margin: 3px 0; }
          .info { background: #f0f0f0; padding: 8px 15px; border-bottom: 1px solid #ccc; font-size: 9px; }
          .stats { display: flex; margin: 0; background: white; }
          .stat { flex: 1; padding: 10px; border-right: 1px solid #ddd; text-align: center; }
          .stat:last-child { border-right: none; }
          .stat-label { font-size: 8px; color: #666; font-weight: bold; text-transform: uppercase; }
          .stat-value { font-size: 14px; font-weight: bold; margin: 3px 0; }
          .entrada { color: #56d364; }
          .saida { color: #f85149; }
          .saldo { color: #0d1117; }
          .footer { text-align: center; font-size: 8px; color: #999; margin-top: 10px; padding: 8px; border-top: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Relatório Anual - ${currentYear}</h1>
        </div>
        <div class="info">
          <p><strong>Usuário:</strong> ${
            usuarioLogado.name
          } | <strong>Email:</strong> ${usuarioLogado.email}</p>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-label">Total Entradas</div>
            <div class="stat-value entrada">R$ ${totalEntradas.replace(
              ".",
              ","
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Saídas</div>
            <div class="stat-value saida">R$ ${totalSaidas.replace(
              ".",
              ","
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Saldo Anual</div>
            <div class="stat-value saldo">R$ ${saldo.replace(".", ",")}</div>
          </div>
        </div>
        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </body>
      </html>`;

      const opt = {
        margin: 3,
        filename: `relatorio_anual_${usuarioLogado.id}_${currentYear}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 1.2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(html).save();
    })
    .catch((err) => {
      console.error("Erro:", err);
      alert("Erro ao gerar relatório anual");
    });
}
