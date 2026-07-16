/* ============================================================
   QUIZ SCREEN LOGIC (quiz.html)
   Reads settings saved by setup.js, fetches questions, and
   runs the quiz. On completion, saves the score and redirects
   to result.html.
   ============================================================ */

/* ------------------------------------------------------------
   STATE
   ------------------------------------------------------------ */
let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let reviewLog = [];
let quizSettings = {};

const QUESTION_TIME = 30; // seconds per question
let timeLeft = QUESTION_TIME;
let timerInterval = null;

let streak = 0;
let correctCount = 0;

/* Combo multiplier: longer streaks earn more points per correct
   answer. Points earned for a correct answer = getMultiplier(streak). */
function getMultiplier(currentStreak) {
  if (currentStreak >= 10) return 4;
  if (currentStreak >= 5) return 3;
  if (currentStreak >= 3) return 2;
  return 1;
}

/* ------------------------------------------------------------
   DOM REFERENCES
   ------------------------------------------------------------ */
const loadingScreen = document.getElementById("loading-screen");
const quizScreen = document.getElementById("quiz-screen");
const errorScreen = document.getElementById("quiz-error-screen");
const errorMessage = document.getElementById("quiz-error-message");
const backToSetupBtn = document.getElementById("back-to-setup-btn");

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");
const scoreLabel = document.getElementById("score-label");
const timerLabel = document.getElementById("timer-label");
const streakLabel = document.getElementById("streak-label");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

/* ------------------------------------------------------------
   INIT: read settings, fetch questions, start quiz.
   ------------------------------------------------------------ */
async function init() {
  const settingsRaw = sessionStorage.getItem("quizSettings");

  // No settings found (e.g. user navigated here directly) — send
  // them back to setup instead of showing a broken quiz.
  if (!settingsRaw) {
    window.location.href = "index.html";
    return;
  }

  const settings = JSON.parse(settingsRaw);
  quizSettings = settings;

  try {
    questions = await fetchQuestions(settings);
    loadingScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    renderQuestion();
  } catch (err) {
    loadingScreen.classList.add("hidden");
    errorScreen.classList.remove("hidden");
    errorMessage.textContent = err.message || "Failed to load questions.";
  }
}

/* ------------------------------------------------------------
   RENDER CURRENT QUESTION
   ------------------------------------------------------------ */
function renderQuestion() {
  answered = false;
  nextBtn.classList.remove("visible");

  const q = questions[currentIndex];
  questionText.textContent = q.question;

  progressLabel.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  scoreLabel.textContent = `Score: ${score} pts`;

  optionsContainer.innerHTML = "";

  q.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    optionsContainer.appendChild(btn);
  });

  startTimer();
}

/* ------------------------------------------------------------
   TIMER: counts down from QUESTION_TIME each question. If it
   hits zero before an answer is picked, the question is marked
   wrong and the quiz auto-advances.
   ------------------------------------------------------------ */
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = QUESTION_TIME;
  updateTimerLabel();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerLabel();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerLabel() {
  timerLabel.textContent = `⏱ ${timeLeft}s`;
  timerLabel.classList.toggle("low", timeLeft <= 10);
}

/* ------------------------------------------------------------
   STREAK LABEL: shown once the streak reaches 2+, hidden
   otherwise. Displays the active multiplier once it kicks in.
   ------------------------------------------------------------ */
function updateStreakLabel() {
  if (streak >= 2) {
    const multiplier = getMultiplier(streak);
    streakLabel.textContent =
      multiplier > 1 ? `🔥 ${streak} streak (x${multiplier})` : `🔥 ${streak} streak`;
    streakLabel.classList.remove("hidden");
    streakLabel.classList.remove("pop-animation");
    void streakLabel.offsetWidth; // restart animation
    streakLabel.classList.add("pop-animation");
  } else {
    streakLabel.classList.add("hidden");
  }
}

/* ------------------------------------------------------------
   HANDLE TIMEOUT: no answer selected in time — mark wrong in
   the review log and skip to the next question immediately.
   ------------------------------------------------------------ */
function handleTimeout() {
  if (answered) return;
  answered = true;
  streak = 0;
  updateStreakLabel();

  const q = questions[currentIndex];
  const allButtons = optionsContainer.querySelectorAll(".option-btn");
  allButtons.forEach((btn) => {
    btn.disabled = true;
  });

  reviewLog.push({
    question: q.question,
    options: q.options,
    selectedIndex: null,
    correctIndex: q.correctIndex
  });

  advanceQuestion();
}

/* ------------------------------------------------------------
   HANDLE ANSWER SELECTION
   ------------------------------------------------------------ */
function selectAnswer(selectedIndex, selectedBtn) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const q = questions[currentIndex];
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  allButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correctIndex) {
      btn.classList.add("correct");
    }
  });

  if (selectedIndex === q.correctIndex) {
    streak++;
    correctCount++;
    const multiplier = getMultiplier(streak);
    score += multiplier;
    selectedBtn.classList.add("pop-animation");
    correctSound.currentTime = 0;
    correctSound.play();
  } else {
    streak = 0;
    selectedBtn.classList.add("wrong", "shake-animation");
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  updateStreakLabel();

  reviewLog.push({
    question: q.question,
    options: q.options,
    selectedIndex,
    correctIndex: q.correctIndex
  });

  scoreLabel.textContent = `Score: ${score} pts`;
  nextBtn.classList.add("visible");
}

/* ------------------------------------------------------------
   NEXT QUESTION / END QUIZ
   ------------------------------------------------------------ */
nextBtn.addEventListener("click", advanceQuestion);

function advanceQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

/* ------------------------------------------------------------
   FINISH: save result to sessionStorage, redirect to result.html
   ------------------------------------------------------------ */
function finishQuiz() {
  clearInterval(timerInterval);

  const category = questions.length > 0 ? questions[0].category : "Mixed";
  const difficulty = quizSettings.difficulty
    ? quizSettings.difficulty.charAt(0).toUpperCase() + quizSettings.difficulty.slice(1)
    : "Mixed";

  const result = {
    score,
    total: questions.length,
    correctCount,
    category,
    difficulty
  };
  sessionStorage.setItem("quizResult", JSON.stringify(result));
  sessionStorage.setItem("quizReview", JSON.stringify(reviewLog));
  window.location.href = "result.html";
}

/* ------------------------------------------------------------
   Back to setup (from error screen)
   ------------------------------------------------------------ */
backToSetupBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ------------------------------------------------------------
   KEYBOARD SUPPORT
   Number keys 1-4 select the matching option (only while the
   question is unanswered). Enter moves to the next question
   (only once the Next button is visible, i.e. after answering).
   ------------------------------------------------------------ */
document.addEventListener("keydown", (event) => {
  if (quizScreen.classList.contains("hidden")) return;

  if (["1", "2", "3", "4"].includes(event.key)) {
    if (answered) return;
    const optionIndex = Number(event.key) - 1;
    const allButtons = optionsContainer.querySelectorAll(".option-btn");
    const targetBtn = allButtons[optionIndex];
    if (targetBtn) {
      targetBtn.focus();
      selectAnswer(optionIndex, targetBtn);
    }
  }

  if (event.key === "Enter" && nextBtn.classList.contains("visible")) {
    nextBtn.click();
  }
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();