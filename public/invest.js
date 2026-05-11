document.addEventListener("DOMContentLoaded", function () {
  const investForm = document.getElementById("investForm");
  const creditScore = document.getElementById("creditScore");
  const creditValue = document.getElementById("creditValue");
  const creditLabel = document.getElementById("creditLabel");

  function getCreditLabel(score) {
    if (score < 580) return "Poor";
    if (score < 670) return "Fair";
    if (score < 740) return "Good";
    if (score < 800) return "Very Good";
    return "Excellent";
  }

  creditScore.addEventListener("input", function () {
    const score = Number(creditScore.value);
    creditValue.textContent = score;
    creditLabel.textContent = getCreditLabel(score);
  });

  investForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = localStorage.getItem("currentUserId");

    const investmentInfo = {
      userId,
      totalInvested:
        Number(document.getElementById("totalInvested").value) || 0,
      yearReturn: Number(document.getElementById("yearReturn").value) || 0,
      creditScore: Number(creditScore.value),
      creditLabel: getCreditLabel(Number(creditScore.value)),
    };

    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investmentInfo),
      });

      if (!response.ok) {
        throw new Error("Failed to save investment info");
      }

      window.location.href = "review.html";
    } catch (error) {
      console.log(error);
      alert("Error saving investments. Check your server.");
    }
  });
});
