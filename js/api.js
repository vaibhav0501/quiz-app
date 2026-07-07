/* ============================================================
   API MODULE
   Talks to the Open Trivia DB (https://opentdb.com).
   Used by both setup.js (categories) and quiz.js (questions).
   ============================================================ */

const TRIVIA_BASE_URL = "https://opentdb.com/api.php";
const CATEGORY_URL = "https://opentdb.com/api_category.php";

/* ------------------------------------------------------------
   Decode HTML entities like &quot; &#039; &amp; into real
   characters. The Trivia API encodes text this way by default.
   ------------------------------------------------------------ */
function decodeHTML(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/* ------------------------------------------------------------
   Shuffle an array in place (Fisher-Yates) and return it.
   Used to mix correct + incorrect answers together.
   ------------------------------------------------------------ */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* ------------------------------------------------------------
   Fetch all available categories.
   Returns an array like:
   [{ id: 9, name: "General Knowledge" }, ...]
   ------------------------------------------------------------ */
async function fetchCategories() {
  const response = await fetch(CATEGORY_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.trivia_categories;
}

/* ------------------------------------------------------------
   Fetch quiz questions.
   params = { amount, category, difficulty }
   category can be "" (any category) or a category id.
   Returns an array of normalized question objects:
   { question, options: [...], correctIndex }
   ------------------------------------------------------------ */
async function fetchQuestions(params) {
  const url = new URL(TRIVIA_BASE_URL);
  url.searchParams.set("amount", params.amount);
  url.searchParams.set("type", "multiple"); // multiple choice only

  if (params.category) {
    url.searchParams.set("category", params.category);
  }
  if (params.difficulty) {
    url.searchParams.set("difficulty", params.difficulty);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  const data = await response.json();

  // response_code 0 = success. Other codes mean no questions matched
  // the chosen filters (e.g. category/difficulty combo too narrow).
  if (data.response_code !== 0) {
    throw new Error("No questions available for these settings");
  }

  return data.results.map((item) => {
    const options = shuffleArray([
      ...item.incorrect_answers,
      item.correct_answer
    ]).map(decodeHTML);

    const correctIndex = options.indexOf(decodeHTML(item.correct_answer));

    return {
      question: decodeHTML(item.question),
      options,
      correctIndex
    };
  });
}