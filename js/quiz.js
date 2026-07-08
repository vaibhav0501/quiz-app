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
  scoreLabel.textContent = `Score: ${score}`;

  optionsContainer.innerHTML = "";

  q.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    optionsContainer.appendChild(btn);
  });
}

/* ------------------------------------------------------------
   HANDLE ANSWER SELECTION
   ------------------------------------------------------------ */
function selectAnswer(selectedIndex, selectedBtn) {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  allButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correctIndex) {
      btn.classList.add("correct");
    }
  });

  if (selectedIndex === q.correctIndex) {
    score++;
    selectedBtn.classList.add("pop-animation");
    correctSound.currentTime = 0;
    correctSound.play();
  } else {
    selectedBtn.classList.add("wrong", "shake-animation");
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  scoreLabel.textContent = `Score: ${score}`;
  nextBtn.classList.add("visible");
}

/* ------------------------------------------------------------
   NEXT QUESTION / END QUIZ
   ------------------------------------------------------------ */
nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

/* ------------------------------------------------------------
   FINISH: save result to sessionStorage, redirect to result.html
   ------------------------------------------------------------ */
function finishQuiz() {
  const result = {
    score,
    total: questions.length
  };
  sessionStorage.setItem("quizResult", JSON.stringify(result));
  window.location.href = "result.html";
}

/* ------------------------------------------------------------
   Back to setup (from error screen)
   ------------------------------------------------------------ */
backToSetupBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ============================================================
   KICK OFF
   ============================================================ */
init();