/* ============================================================
   SETUP SCREEN LOGIC (index.html)
   Loads categories into the dropdown, wires up the amount
   slider, and saves user choices before starting the quiz.
   ============================================================ */

const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const amountSlider = document.getElementById("amount");
const amountValueLabel = document.getElementById("amount-value");
const startBtn = document.getElementById("start-btn");
const setupError = document.getElementById("setup-error");

/* ------------------------------------------------------------
   Load categories into the dropdown on page load.
   ------------------------------------------------------------ */
async function loadCategories() {
  try {
    const categories = await fetchCategories();

    categorySelect.innerHTML = "";

    // "Any Category" lets the user skip filtering by category
    const anyOption = document.createElement("option");
    anyOption.value = "";
    anyOption.textContent = "Any Category";
    categorySelect.appendChild(anyOption);

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  } catch (err) {
    setupError.classList.remove("hidden");
    categorySelect.innerHTML = '<option value="">Unavailable</option>';
    startBtn.disabled = true;
  }
}

/* ------------------------------------------------------------
   Keep the "Number of Questions: X" label in sync with the
   range slider as the user drags it.
   ------------------------------------------------------------ */
amountSlider.addEventListener("input", () => {
  amountValueLabel.textContent = amountSlider.value;
});

/* ------------------------------------------------------------
   On Start Quiz: save settings to sessionStorage and redirect.
   sessionStorage is used (not localStorage) so settings clear
   automatically when the browser tab is closed.
   ------------------------------------------------------------ */
startBtn.addEventListener("click", () => {
  const settings = {
    category: categorySelect.value,
    difficulty: difficultySelect.value,
    amount: amountSlider.value
  };

  sessionStorage.setItem("quizSettings", JSON.stringify(settings));
  window.location.href = "quiz.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
loadCategories();