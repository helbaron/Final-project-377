let debtCount = 1;

const addDebtBtn = document.querySelector(".add-debt");
const debtForm = document.getElementById("debtForm");

addDebtBtn.addEventListener("click", function () {
  debtCount++;

  const newDebt = document.createElement("div");
  newDebt.className = "debt-box";

  newDebt.innerHTML = `
    <p class="debt-number">Debt ${debtCount}</p>

    <div class="debt-row">
      <div>
        <label>Type</label>
        <select class="debtType">
          <option>💳 Credit Card</option>
          <option>🎓 Student Loan</option>
          <option>🚗 Auto Loan</option>
          <option>🏠 Mortgage</option>
        </select>
      </div>

      <div class="debt-name">
        <label>Debt Name</label>
        <input class="debtName" type="text" placeholder="e.g. Student Loan" required>
      </div>
    </div>

    <div class="two-columns">
      <div>
        <label>Current Balance</label>
        <input class="currentBalance" type="number" placeholder="5,000" required>
      </div>

      <div>
        <label>Original Amount</label>
        <input class="originalAmount" type="number" placeholder="10,000" required>
      </div>
    </div>

    <div class="two-columns">
      <div>
        <label>Interest Rate (APR)</label>
        <input class="interestRate" type="number" step="0.1" placeholder="4.5" required>
      </div>

      <div>
        <label>Monthly Payment</label>
        <input class="monthlyPayment" type="number" placeholder="200" required>
      </div>
    </div>
  `;

  debtForm.insertBefore(newDebt, addDebtBtn);
});

debtForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userId = localStorage.getItem("currentUserId");

  if (!userId) {
    alert("No current user found. Please restart from the first page.");
    window.location.href = "index.html";
    return;
  }

  const debtBoxes = document.querySelectorAll(".debt-box");
  const debts = [];

  for (const box of debtBoxes) {
    const debt = {
      type: box.querySelector("select").value,
      name: box.querySelector(".debtName").value.trim(),
      balance: Number(box.querySelector(".currentBalance").value),
      original: Number(box.querySelector(".originalAmount").value),
      interest: Number(box.querySelector(".interestRate").value),
      payment: Number(box.querySelector(".monthlyPayment").value),
    };

    if (debt.balance > debt.original) {
      alert("Current balance cannot exceed original amount");
      return;
    }

    debts.push(debt);
  }

  try {
    const userId = localStorage.getItem("currentUserId");

    const response = await fetch("/api/debts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        debts: debts,
      }),
    });

    if (!response.ok) throw new Error("Failed to save debts");

    const fromDashboard =
      new URLSearchParams(window.location.search).get("from") === "dashboard";
    window.location.href = fromDashboard ? "dashboard.html" : "invest.html";
  } catch (error) {
    console.error(error);
    alert("Error saving debts.");
  }
});
