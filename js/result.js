/* ============================================================
   RESULT SCREEN LOGIC (result.html)
   Reads the score saved by quiz.js and displays it.
   ============================================================ */

const resultScore = document.getElementById("result-score");
const resultMessage = document.getElementById("result-message");
const restartBtn = document.getElementById("restart-btn");

/* ------------------------------------------------------------
   INIT: read result, display it. If missing, send back to setup.
   ------------------------------------------------------------ */
function init() {
  const resultRaw = sessionStorage.getItem("quizResult");

  if (!resultRaw) {
    window.location.href = "index.html";
    return;
  }

  const { score, total } = JSON.parse(resultRaw);

  resultScore.textContent = `${score} / ${total}`;

  const percentage = (score / total) * 100;
  let message;
  if (percentage === 100) message = "Perfect score! Excellent work.";
  else if (percentage >= 60) message = "Nice job! Solid understanding.";
  else message = "Good effort. Review and try again!";

  resultMessage.textContent = message;

  // Clear the result so refreshing this page later (in a new quiz
  // attempt) doesn't show stale data.
  sessionStorage.removeItem("quizResult");
}

/* ------------------------------------------------------------
   RESTART: clear settings too, go back to setup screen.
   ------------------------------------------------------------ */
restartBtn.addEventListener("click", () => {
  sessionStorage.removeItem("quizSettings");
  window.location.href = "index.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();