// Estado global
let transactions = [];
let filters = { month: "todos", type: "todos" };
let charts = {};

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

// Persistência Mudar Para Banco de Dados
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const data = localStorage.getItem("transactions");
  if (data) {
    transactions = JSON.parse(data);
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
            <td>${t.desc}</td>
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
  .addEventListener("submit", function (e) {
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

    const transaction = { id: Date.now(), date, desc, category, amount, type };
    transactions.push(transaction);
    saveTransactions();
    renderAll();
    this.reset();
    document.getElementById("form-error").style.display = "none";
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
  .addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-remove")) {
      const id = parseInt(e.target.dataset.id);
      transactions = transactions.filter((t) => t.id !== id);
      saveTransactions();
      renderAll();
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

loadTransactions();
renderAll();
