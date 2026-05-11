let investmentChart;

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  } else {
    console.log(`Missing element: ${id}`);
  }
}
document.addEventListener("DOMContentLoaded", async function () {
  await loadDashboardData();
  loadMarketData();
  loadStockChart("AAPL");
});

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

async function getData(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`${url} failed: ${error}`);
  }
  return res.json();
}
let stockLineChart = null;
let currentStock = "AAPL";

async function loadStockChart(symbol) {
  const ctx = document.getElementById("stockLineChart");
  if (!ctx) return;

  try {
    const data = await getData(`/api/market/history/${symbol}`);

    const labels = data.map((d) => d.date);
    const prices = data.map((d) => d.price);

    const isUp = prices[prices.length - 1] >= prices[0];
    const color = isUp ? "#6c63ff" : "#ff6584";

    if (stockLineChart) stockLineChart.destroy();

    stockLineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${symbol} Price (USD)`,
            data: prices,
            borderColor: color,
            backgroundColor: color + "22",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#94a3b8", font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${Number(ctx.parsed.y).toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#94a3b8",
              maxTicksLimit: 6,
              maxRotation: 0,
            },
            grid: { color: "#1e293b" },
          },
          y: {
            ticks: {
              color: "#94a3b8",
              callback: (val) => `$${val}`,
            },
            grid: { color: "#1e293b" },
          },
        },
      },
    });
  } catch (error) {
    console.error("Stock chart error:", error);
  }
}

function selectStock(symbol) {
  currentStock = symbol;

  // Update active button
  document.querySelectorAll(".stock-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === symbol);
  });

  loadStockChart(symbol);
}
async function loadDashboardData() {
  try {
    const userId = localStorage.getItem("currentUserId");

    const user = await getData(`/api/users/${userId}`);
    const goals = await getData(`/api/goals/${userId}`);
    const debts = await getData(`/api/debts/${userId}`);
    const investmentsArr = await getData(`/api/investments/${userId}`);
    const investments = investmentsArr[0] || {};

    const name = user.name || "User";
    const income = Number(user.monthly_income) || 0;
    const expenses = Number(user.monthly_expenses) || 0;
    const monthlySavings = income - expenses;

    const totalInvested = Number(investments.total_invested) || 0;
    const totalDebt = debts.reduce(
      (sum, debt) => sum + Number(debt.balance || 0),
      0,
    );
    const totalGoalSaved = goals.reduce(
      (sum, goal) => sum + Number(goal.already_saved || 0),
      0,
    );

    const assets = totalInvested + totalGoalSaved;
    const netWorth = assets - totalDebt;
    const savingsRate =
      income > 0 ? Math.round((monthlySavings / income) * 100) : 0;

    setText("profileName", name);
    setText("welcomeText", `Hello, ${name} 👋`);
    setText("netWorth", money(netWorth));
    setText("assets", money(assets));
    setText("liabilities", money(totalDebt));
    setText("savingsRate", `${savingsRate}%`);
    setText("monthlyIncome", money(income));
    setText("monthlyExpenses", money(expenses));
    setText("totalInvested", money(totalInvested));
    setText("creditScore", `${investments.credit_score || 700} / 850`);
    setText(
      "aiInsight",
      `At your current savings rate of ${savingsRate}%, you can contribute about ${money(monthlySavings)} per month.`,
    );

    renderGoals(goals);
    renderDebts(debts, totalDebt);
    renderNetWorthChart(assets, totalDebt);
  } catch (error) {
    console.error("Dashboard error:", error);
    alert(error.message);
  }
}
function renderNetWorthChart(assets, liabilities) {
  const ctx = document.getElementById("netWorthChart");
  if (!ctx) return;

  // Destroy old chart if it exists (prevents duplicate chart error)
  if (investmentChart) {
    investmentChart.destroy();
  }

  investmentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Assets", "Liabilities"],
      datasets: [
        {
          data: [assets || 0, liabilities || 0],
          backgroundColor: ["#6c63ff", "#ff6584"],
          borderColor: ["#5a52d5", "#e05570"],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "50%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#94a3b8",
            padding: 20,
            font: { size: 13 },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed;
              return ` $${Number(value).toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}
function renderGoals(goals) {
  const goalsGrid = document.getElementById("goalsGrid");
  goalsGrid.innerHTML = "";

  if (!goals || goals.length === 0) {
    goalsGrid.innerHTML = "<p>No goals added yet.</p>";
    return;
  }

  goals.forEach((goal) => {
    const saved = Number(goal.already_saved || 0);
    const target = Number(goal.target_amount || 0);
    const percent = target > 0 ? Math.round((saved / target) * 100) : 0;

    const card = document.createElement("div");
    card.className = "goal-card";

    card.innerHTML = `
      <div class="goal-top">
        <div>
          <h3>${goal.icon || "🎯"} ${goal.name}</h3>
          <p>Target: ${goal.target_date || "No date"}</p>
        </div>
        <div class="percent-circle">${percent}%</div>
      </div>

      <div class="progress-line">
        <div class="progress-fill" style="width: ${Math.min(percent, 100)}%;"></div>
      </div>

      <p>${money(saved)} saved of ${money(target)}</p>
    `;

    goalsGrid.appendChild(card);
  });
}

function renderDebts(debts, totalDebt) {
  const debtSummary = document.getElementById("debtSummary");
  const debtList = document.getElementById("debtList");

  debtSummary.textContent = `${money(totalDebt)} remaining`;
  debtList.innerHTML = "";

  if (!debts || debts.length === 0) {
    debtList.innerHTML = "<p>No debts added yet.</p>";
    return;
  }

  debts.forEach((debt) => {
    const balance = Number(debt.balance || 0);
    const original = Number(debt.original || 0);
    const paidPercent =
      original > 0 ? Math.round(((original - balance) / original) * 100) : 0;

    const item = document.createElement("div");
    item.className = "debt-item";

    item.innerHTML = `
      <strong>${debt.type || "💳"} ${debt.name}</strong>
      <p>${paidPercent}% paid off · Balance: ${money(balance)}</p>
      <div class="progress-line">
        <div class="progress-fill" style="width: ${Math.max(paidPercent, 0)}%;"></div>
      </div>
    `;

    debtList.appendChild(item);
  });
}

async function loadMarketData() {
  const marketGrid = document.getElementById("stockMarketGrid");

  if (!marketGrid) return;

  try {
    const response = await fetch("/api/market");

    if (!response.ok) throw new Error("Market API failed");

    const stocks = await response.json();

    if (!stocks || stocks.length === 0) {
      marketGrid.innerHTML = "<p>No market data returned.</p>";
      return;
    }

    marketGrid.innerHTML = "";

    stocks.forEach((stock) => {
      const isPositive = stock.change >= 0;
      const card = document.createElement("div");
      card.className = "stock-card";

      card.innerHTML = `
        <h3>${stock.ticker}</h3>
        <strong>$${Number(stock.price).toFixed(2)}</strong>
        <p class="${isPositive ? "green" : "red"}">
          ${isPositive ? "▲" : "▼"} ${Math.abs(Number(stock.change)).toFixed(2)}
          (${Number(stock.changePercent).toFixed(2)}%)
        </p>
      `;

      marketGrid.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    marketGrid.innerHTML = "<p>Error loading stock market data.</p>";
  }
}
