document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("aboutForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const monthlyIncome = Number(
      document.getElementById("monthlyIncome").value,
    );
    const monthlyExpenses = Number(
      document.getElementById("monthlyExpenses").value,
    );

    if (monthlyExpenses > monthlyIncome) {
      alert("Monthly expenses cannot be higher than monthly income.");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          monthlyIncome,
          monthlyExpenses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      const savedUser = await response.json();

      localStorage.setItem("currentUserId", savedUser[0].id);

      window.location.href = "goals.html";
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
});
