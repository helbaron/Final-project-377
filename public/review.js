async function getData(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${url} failed: ${errorText}`);
  }

  return res.json();
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const userId = localStorage.getItem("currentUserId");

    if (!userId) {
      alert("No current user found. Please restart from the first page.");
      window.location.href = "index.html";
      return;
    }

    const user = await getData(`/api/users/${userId}`);
    const goals = await getData(`/api/goals/${userId}`);
    const debts = await getData(`/api/debts/${userId}`);
    const investmentsArr = await getData(`/api/investments/${userId}`);

    const investments = investmentsArr[0] || {};

    const income = Number(user.monthly_income) || 0;
    const expenses = Number(user.monthly_expenses) || 0;
    const savingsRate =
      income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    document.getElementById("reviewName").textContent = user.name || "—";
    document.getElementById("reviewIncome").textContent = income
      ? `$${income.toLocaleString()}`
      : "—";
    document.getElementById("reviewSavingsRate").textContent =
      `${savingsRate}%`;

    const goalsBox = document.getElementById("reviewGoals");

    if (goals.length > 0) {
      goalsBox.innerHTML = goals
        .map(
          (goal) => `
        <div class="goal-review-item">
          ${goal.icon || "🎯"} <strong>${goal.name}</strong> —
          $${Number(goal.already_saved || 0).toLocaleString()}
          saved of $${Number(goal.target_amount || 0).toLocaleString()}
        </div>
      `,
        )
        .join("");
    } else {
      goalsBox.textContent = "No goals added";
    }

    const debtsBox = document.getElementById("reviewDebts");

    if (debts.length > 0) {
      debtsBox.innerHTML = debts
        .map(
          (debt) => `
        <div class="debt-review-item">
          ${debt.type || "💳"} <strong>${debt.name}</strong> —
          Balance: $${Number(debt.balance || 0).toLocaleString()}
        </div>
      `,
        )
        .join("");
    } else {
      debtsBox.textContent = "No debts added";
    }

    document.getElementById("reviewInvested").textContent =
      investments.total_invested !== undefined
        ? `$${Number(investments.total_invested).toLocaleString()}`
        : "—";

    document.getElementById("reviewReturn").textContent =
      `${investments.year_return || 0}%`;

    document.getElementById("reviewCredit").textContent =
      `${investments.credit_score || 700} / 850`;
  } catch (error) {
    console.error("Review error:", error);
    alert(error.message);
  }
});
