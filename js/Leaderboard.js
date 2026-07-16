/* ============================================================
   LEADERBOARD SCREEN LOGIC (leaderboard.html)
   Reads saved score entries from localStorage (persists across
   sessions, unlike the sessionStorage used for quiz state) and
   displays them ranked by points, highest first.
   ============================================================ */

const LEADERBOARD_KEY = "quizLeaderboard";

const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardEmpty = document.getElementById("leaderboard-empty");
const leaderboardBackBtn = document.getElementById("leaderboard-back-btn");

/* ------------------------------------------------------------
   INIT: load entries and render them.
   ------------------------------------------------------------ */
function init() {
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch (err) {
    leaderboard = [];
  }

  if (leaderboard.length === 0) {
    leaderboardEmpty.classList.remove("hidden");
    return;
  }

  // Already saved sorted, but sort again defensively in case entries
  // were written by an older version of the save logic.
  leaderboard.sort((a, b) => b.score - a.score);

  renderLeaderboard(leaderboard);
}

/* ------------------------------------------------------------
   RENDER: one ranked row per entry.
   ------------------------------------------------------------ */
function renderLeaderboard(leaderboard) {
  leaderboardList.innerHTML = "";

  leaderboard.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    if (index === 0) item.classList.add("rank-gold");
    else if (index === 1) item.classList.add("rank-silver");
    else if (index === 2) item.classList.add("rank-bronze");

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    rank.textContent = `#${index + 1}`;

    const info = document.createElement("div");
    info.className = "leaderboard-info";

    const nameEl = document.createElement("span");
    nameEl.className = "leaderboard-name";
    nameEl.textContent = entry.name;

    const metaEl = document.createElement("span");
    metaEl.className = "leaderboard-meta";
    const dateStr = entry.date ? new Date(entry.date).toLocaleDateString() : "";
    metaEl.textContent = `${entry.category} · ${entry.difficulty} · ${entry.correctCount}/${entry.total} correct · ${dateStr}`;

    info.appendChild(nameEl);
    info.appendChild(metaEl);

    const scoreEl = document.createElement("span");
    scoreEl.className = "leaderboard-score";
    scoreEl.textContent = `${entry.score} pts`;

    item.appendChild(rank);
    item.appendChild(info);
    item.appendChild(scoreEl);
    leaderboardList.appendChild(item);
  });
}

/* ------------------------------------------------------------
   BACK: return to setup screen.
   ------------------------------------------------------------ */
leaderboardBackBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();