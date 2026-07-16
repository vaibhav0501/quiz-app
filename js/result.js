/* ============================================================
   RESULT SCREEN LOGIC (result.html)
   Reads the score saved by quiz.js and displays it.
   ============================================================ */

const resultScore = document.getElementById("result-score");
const resultAccuracy = document.getElementById("result-accuracy");
const resultMessage = document.getElementById("result-message");
const restartBtn = document.getElementById("restart-btn");
const reviewBtn = document.getElementById("review-btn");
const nameInput = document.getElementById("name-input");
const saveScoreBtn = document.getElementById("save-score-btn");
const saveScoreRow = document.getElementById("save-score-row");
const saveConfirm = document.getElementById("save-confirm");

const LEADERBOARD_KEY = "quizLeaderboard";
const LEADERBOARD_MAX_ENTRIES = 20;

// Kept around after quizResult is cleared from sessionStorage, so the
// Save Score button (clicked later, on this same page) still has the data.
let currentResult = null;

/* ------------------------------------------------------------
   INIT: read result, display it. If missing, send back to setup.
   ------------------------------------------------------------ */
function init() {
  const resultRaw = sessionStorage.getItem("quizResult");

  if (!resultRaw) {
    window.location.href = "index.html";
    return;
  }

  currentResult = JSON.parse(resultRaw);
  const { score, total, correctCount } = currentResult;

  // correctCount may be missing on older saved results (pre-combo-multiplier);
  // fall back to treating score as the correct count in that case.
  const correct = typeof correctCount === "number" ? correctCount : score;

  resultScore.textContent = `${score} pts`;
  resultAccuracy.textContent = `${correct} / ${total} correct`;

  const percentage = (correct / total) * 100;
  let message;
  if (percentage === 100) message = "Perfect score! Excellent work.";
  else if (percentage >= 60) message = "Nice job! Solid understanding.";
  else message = "Good effort. Review and try again!";

  resultMessage.textContent = message;

  // Hide the review button if there's no review data to show
  // (e.g. an older quizResult without a matching quizReview).
  if (!sessionStorage.getItem("quizReview")) {
    reviewBtn.classList.add("hidden");
  }

  // Clear the result so refreshing this page later (in a new quiz
  // attempt) doesn't show stale data. quizReview is kept around so
  // the review page can still read it after this page loads.
  sessionStorage.removeItem("quizResult");
}

/* ------------------------------------------------------------
   SAVE SCORE: add an entry to the localStorage leaderboard,
   ranked by points (score). Keeps only the top N entries.
   ------------------------------------------------------------ */
saveScoreBtn.addEventListener("click", () => {
  if (!currentResult) return;

  const name = nameInput.value.trim() || "Anonymous";
  const entry = {
    name,
    score: currentResult.score,
    correctCount: currentResult.correctCount,
    total: currentResult.total,
    category: currentResult.category || "Mixed",
    difficulty: currentResult.difficulty || "Mixed",
    date: new Date().toISOString()
  };

  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch (err) {
    leaderboard = [];
  }

  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, LEADERBOARD_MAX_ENTRIES);

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));

  saveScoreRow.classList.add("hidden");
  saveConfirm.classList.remove("hidden");
});

/* ------------------------------------------------------------
   REVIEW: go to the review screen (quizReview stays intact).
   ------------------------------------------------------------ */
reviewBtn.addEventListener("click", () => {
  window.location.href = "review.html";
});

/* ------------------------------------------------------------
   RESTART: clear settings + review data, go back to setup screen.
   ------------------------------------------------------------ */
restartBtn.addEventListener("click", () => {
  sessionStorage.removeItem("quizSettings");
  sessionStorage.removeItem("quizReview");
  window.location.href = "index.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();