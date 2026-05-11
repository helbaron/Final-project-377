const express = require("express");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ─── USERS ────

app.post("/api/users", async (req, res) => {
  const { name, monthlyIncome, monthlyExpenses } = req.body;

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
      },
    ])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ─── GOALS ─────

app.post("/api/goals", async (req, res) => {
  const { userId, goals } = req.body;

  const formattedGoals = goals.map((goal) => ({
    user_id: userId,
    icon: goal.icon,
    name: goal.name,
    already_saved: goal.alreadySaved,
    target_amount: goal.targetAmount,
    target_date: goal.targetDate,
  }));

  const { data, error } = await supabase
    .from("goals")
    .insert(formattedGoals)
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/api/goals/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ─── DEBTS ──────

app.post("/api/debts", async (req, res) => {
  const { userId, debts } = req.body;

  const formattedDebts = debts.map((debt) => ({
    user_id: userId,
    type: debt.type,
    name: debt.name,
    balance: debt.balance,
    original: debt.original,
    interest: debt.interest,
    payment: debt.payment,
  }));

  const { data, error } = await supabase
    .from("debts")
    .insert(formattedDebts)
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/api/debts/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ─── INVESTMENTS ───────

app.post("/api/investments", async (req, res) => {
  const { userId, totalInvested, yearReturn, creditScore, creditLabel } =
    req.body;

  const { data, error } = await supabase
    .from("investments")
    .insert([
      {
        user_id: userId,
        total_invested: totalInvested,
        year_return: yearReturn,
        credit_score: creditScore,
        credit_label: creditLabel,
      },
    ])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/api/investments/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  res.json(data);
});

// ─── API STOCK MARKET ────────
app.get("/api/market", async (req, res) => {
  const tickers = ["AAPL", "MSFT", "TSLA", "NVDA"];

  try {
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        const url = `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${process.env.FMP_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) return null;

        const stock = data[0];

        return {
          ticker: stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercentage, // ✅ was stock.changesPercentage
          date: new Date().toISOString().split("T")[0],
        };
      }),
    );

    const filtered = results.filter(Boolean);
    res.json(filtered);
  } catch (error) {
    console.error("Market fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/market/history/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    const url = `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${symbol}&apikey=${process.env.FMP_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(`History ${symbol}:`, JSON.stringify(data).slice(0, 200));

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({ error: "No history data" });
    }

    // Return last 30 days, oldest first for the chart
    const last30 = data.slice(0, 30).reverse();

    const result = last30.map((day) => ({
      date: day.date,
      price: day.close || day.price,
    }));

    res.json(result);
  } catch (error) {
    console.error("History fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── NODE START ──────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
