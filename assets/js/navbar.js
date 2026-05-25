// ── THEME TOGGLE ────────────────────────────────────────────
(function() {
  const html = document.documentElement;
  const saved = localStorage.getItem('fk-theme') || 'light';
  html.setAttribute('data-theme', saved);
})();

function initNavbar() {
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const backBtn = document.getElementById('backButton');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('fk-theme', next);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const referrer = document.referrer;
      const isSamePage = referrer === window.location.href;
      const depth = window.location.pathname.split('/').length - 2;
      const fallback = '../'.repeat(Math.max(0, depth)) + 'index.html';

      if (referrer && !isSamePage) {
        window.history.back();
      } else {
        window.location.assign(fallback);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initNavbar);

// ── SHARED NAVBAR HTML ───────────────────────────────────────
function renderNavbar() {
  return `<nav>
  <div class="nav-inner">
    <a href="../index.html" class="logo">Fix<span>-</span>Kit</a>
    <div class="nav-right">
      <button class="back-btn" id="backButton" aria-label="Go back">
        ←
      </button>
      <button class="theme-btn" id="themeToggle" aria-label="Toggle theme">
        <svg class="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="icon-sun"  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
    </div>
  </div>
</nav>`;
}

function renderFooter() {
  return `<footer>
  <div class="footer-inner">
    <div class="footer-logo">Fix<span>-</span>Kit</div>
    <div class="footer-links">
      <a href="../index.html">Home</a>
      <a href="#">About</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Contact</a>
    </div>
    <p class="footer-copy">© 2025 browser-kit · No login required · No data stored on servers · 100% free forever</p>
  </div>
</footer>`;
}