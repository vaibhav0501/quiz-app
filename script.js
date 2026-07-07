
  /* ============================================================
     DATA: each question has the text, an array of options, and
     the index of the correct answer within that array.
     ============================================================ */
  const questions = [
    {
      question: "Which HTML tag is used to link an external JavaScript file?",
      options: ["<js>", "<script>", "<link>", "<javascript>"],
      correctIndex: 1
    },
    {
      question: "Which keyword declares a variable that can be reassigned?",
      options: ["const", "let", "var only", "static"],
      correctIndex: 1
    },
    {
      question: "What does DOM stand for?",
      options: [
        "Document Object Model",
        "Data Object Method",
        "Display Output Module",
        "Document Order Manager"
      ],
      correctIndex: 0
    },
    {
      question: "Which array method removes items matching a condition and returns a NEW array?",
      options: ["forEach()", "map()", "filter()", "push()"],
      correctIndex: 2
    },
    {
      question: "What will `typeof null` return in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correctIndex: 2
    }
  ];

  /* ============================================================
     STATE
     ============================================================ */
  let currentIndex = 0;
  let score = 0;
  let answered = false; // prevents clicking multiple options per question

  /* ============================================================
     DOM REFERENCES
     ============================================================ */
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options");
  const nextBtn = document.getElementById("next-btn");
  const progressLabel = document.getElementById("progress-label");
  const progressFill = document.getElementById("progress-fill");
  const scoreLabel = document.getElementById("score-label");
  const resultScore = document.getElementById("result-score");
  const resultMessage = document.getElementById("result-message");
  const restartBtn = document.getElementById("restart-btn");

  /* ============================================================
     RENDER CURRENT QUESTION
     ============================================================ */
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

  /* ============================================================
     HANDLE ANSWER SELECTION
     ============================================================ */
  function selectAnswer(selectedIndex, selectedBtn) {
    if (answered) return; // ignore extra clicks after answering
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
    } else {
      selectedBtn.classList.add("wrong");
    }

    scoreLabel.textContent = `Score: ${score}`;
    nextBtn.classList.add("visible");
  }

  /* ============================================================
     NEXT QUESTION / END QUIZ
     ============================================================ */
  nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });

  /* ============================================================
     RESULT SCREEN
     ============================================================ */
  function showResult() {
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resultScore.textContent = `${score} / ${questions.length}`;

    const percentage = (score / questions.length) * 100;
    let message;
    if (percentage === 100) message = "Perfect score! Excellent work.";
    else if (percentage >= 60) message = "Nice job! Solid understanding.";
    else message = "Good effort. Review and try again!";

    resultMessage.textContent = message;
  }

  /* ============================================================
     RESTART
     ============================================================ */
  restartBtn.addEventListener("click", () => {
    currentIndex = 0;
    score = 0;
    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    renderQuestion();
  });

  /* ============================================================
     KICK OFF
     ============================================================ */
  renderQuestion();
