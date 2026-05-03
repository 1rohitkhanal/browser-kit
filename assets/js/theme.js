// ── THEME MANAGEMENT ────────────────────────────────────────────
(function() {
  const THEME_KEY = 'fk-theme';
  const THEMES = ['light', 'dark'];

  /**
   * Get current theme from DOM
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  /**
   * Set theme and persist to localStorage
   */
  function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    const current = getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  /**
   * Initialize theme from localStorage on page load
   */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(saved);
  }

  /**
   * Attach theme toggle button listener
   */
  function attachThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  }

  // Initialize theme on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      attachThemeToggle();
    });
  } else {
    initTheme();
    attachThemeToggle();
  }

  // Expose to global scope
  window.Theme = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme,
  };
})();
