let goalCount = 1;

const addGoalButton = document.querySelector(".add-goal");
const goalsForm = document.getElementById("goalsForm");

addGoalButton.addEventListener("click", function () {
  goalCount++;

  const newGoal = document.createElement("div");
  newGoal.className = "goal-box";

  newGoal.innerHTML = `
    <p class="goal-number">Goal ${goalCount}</p>

    <div class="goal-row">
      <div>
        <label>Icon</label>
        <select class="goalIcon">
                  <option>🛡️</option>
                  <option>🏠</option>
                  <option>🚗</option>
                  <option>🎓</option>
                  <option>✈️</option>
                  <option>💍</option>
                  <option>🛍️</option>
                  <option>💻</option>
        </select>
      </div>

      <div class="goal-name">
        <label>Goal Name</label>
        <input class="goalName" type="text" placeholder="e.g. Emergency Fund" required>
      </div>
    </div>

    <div class="two-columns">
      <div>
        <label>Already Saved</label>
        <input class="alreadySaved" type="number" placeholder="0" required>
      </div>

      <div>
        <label>Target Amount</label>
        <input class="targetAmount" type="number" placeholder="10,000" required>
      </div>
    </div>

    <div class="two-columns">
      <div>
        <label>Target Date</label>
        <input class="targetDate" type="date" required>
      </div>
    </div>
  `;

  goalsForm.insertBefore(newGoal, addGoalButton);
});

goalsForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const userId = localStorage.getItem("currentUserId");

  if (!userId) {
    alert("No current user found. Please restart from the first page.");
    window.location.href = "index.html";
    return;
  }

  const goalBoxes = document.querySelectorAll(".goal-box");
  const goals = [];

  for (const box of goalBoxes) {
    const nameInput =
      box.querySelector(".goalName") || box.querySelector("#goalName");
    const savedInput =
      box.querySelector(".alreadySaved") || box.querySelector("#alreadySaved");
    const targetInput =
      box.querySelector(".targetAmount") || box.querySelector("#targetAmount");
    const dateInput =
      box.querySelector(".targetDate") || box.querySelector("#targetDate");
    const iconInput =
      box.querySelector(".goalIcon") || box.querySelector("#goalIcon");

    if (!nameInput || !savedInput || !targetInput || !dateInput) {
      alert("One of your goal boxes is missing required fields.");
      return;
    }

    const goal = {
      icon: iconInput ? iconInput.value : "🛡️",
      name: nameInput.value.trim(),
      alreadySaved: Number(savedInput.value),
      targetAmount: Number(targetInput.value),
      targetDate: dateInput.value,
    };

    if (goal.alreadySaved > goal.targetAmount) {
      alert(
        `"${goal.name || "A goal"}": Already saved cannot be higher than the target amount.`,
      );
      return;
    }

    goals.push(goal);
  }

  try {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, goals }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(
        `Failed to save goals: ${response.status} - ${errorText}`,
      );
    }

    const fromDashboard =
      new URLSearchParams(window.location.search).get("from") === "dashboard";
    window.location.href = fromDashboard ? "dashboard.html" : "debt.html";
  } catch (error) {
    console.error(error);
    alert("Error saving goals: " + error.message);
  }
});
