/* ============================================================
   REVIEW SCREEN LOGIC (review.html)
   Reads the per-question log saved by quiz.js and displays
   each question with the user's answer vs the correct answer.
   ============================================================ */

const reviewList = document.getElementById("review-list");
const reviewBackBtn = document.getElementById("review-back-btn");

/* ------------------------------------------------------------
   INIT: read review log, render it. If missing, go to setup.
   ------------------------------------------------------------ */
function init() {
  const reviewRaw = sessionStorage.getItem("quizReview");

  if (!reviewRaw) {
    window.location.href = "index.html";
    return;
  }

  const reviewLog = JSON.parse(reviewRaw);
  renderReview(reviewLog);
}

/* ------------------------------------------------------------
   RENDER: build one review item per answered question.
   ------------------------------------------------------------ */
function renderReview(reviewLog) {
  reviewList.innerHTML = "";

  reviewLog.forEach((entry, qIndex) => {
    const item = document.createElement("div");
    item.className = "review-item";

    const questionEl = document.createElement("h3");
    questionEl.className = "review-question";
    questionEl.textContent = `${qIndex + 1}. ${entry.question}`;
    item.appendChild(questionEl);

    if (entry.selectedIndex === null) {
      const timeoutTag = document.createElement("p");
      timeoutTag.className = "review-timeout-tag";
      timeoutTag.textContent = "⏱ Time ran out — no answer selected";
      item.appendChild(timeoutTag);
    }

    const optionsEl = document.createElement("div");
    optionsEl.className = "review-options";

    entry.options.forEach((optionText, optIndex) => {
      const optEl = document.createElement("div");
      optEl.className = "review-option";

      if (optIndex === entry.correctIndex) {
        optEl.classList.add("correct");
      }
      if (optIndex === entry.selectedIndex && entry.selectedIndex !== entry.correctIndex) {
        optEl.classList.add("wrong");
      }

      let tag = "";
      if (optIndex === entry.correctIndex) tag = " ✓";
      else if (optIndex === entry.selectedIndex) tag = " ✗ (your answer)";

      optEl.textContent = optionText + tag;
      optionsEl.appendChild(optEl);
    });

    item.appendChild(optionsEl);
    reviewList.appendChild(item);
  });
}

/* ------------------------------------------------------------
   BACK: clear review + settings, return to setup.
   ------------------------------------------------------------ */
reviewBackBtn.addEventListener("click", () => {
  sessionStorage.removeItem("quizReview");
  sessionStorage.removeItem("quizSettings");
  window.location.href = "index.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();