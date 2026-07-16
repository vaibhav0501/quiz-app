/* ============================================================
   THEME TOGGLE (shared across all pages)
   Applies the saved theme immediately (before the rest of the
   page renders) and wires up the toggle button once the DOM is
   ready. Preference is stored in localStorage so it persists
   across sessions, not just the current quiz attempt.
   ============================================================ */

(function applySavedTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  function updateIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    toggleBtn.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
    updateIcon();
  });

  updateIcon();
});