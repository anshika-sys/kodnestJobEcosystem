/**
 * Job Notification Tracker — Route Skeleton
 * Hash-based routing for static deployment
 */

const ROUTES = {
  '': 'landing',
  '/': 'landing',
  '/dashboard': 'dashboard',
  '/saved': 'saved',
  '/digest': 'digest',
  '/settings': 'settings',
  '/proof': 'proof'
};

function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return ROUTES[hash] || 'landing';
}

function renderLanding() {
  return `
    <section class="landing">
      <h1 class="landing__headline">Stop Missing The Right Jobs.</h1>
      <p class="landing__subtext">Precision-matched job discovery delivered daily at 9AM.</p>
      <a href="#/settings" class="btn btn--primary landing__cta">Start Tracking</a>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="settings-page">
      <h1 class="settings-page__title">Settings</h1>
      <p class="settings-page__subtext">Configure your job preferences.</p>
      <div class="card settings-page__form">
        <div class="form-field">
          <label class="form-field__label" for="role-keywords">Role keywords</label>
          <input type="text" id="role-keywords" class="input" placeholder="e.g. Frontend, React, Product Manager">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="locations">Preferred locations</label>
          <input type="text" id="locations" class="input" placeholder="e.g. Bangalore, Remote, Mumbai">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="mode">Mode</label>
          <select id="mode" class="input">
            <option value="">Select mode</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label" for="experience">Experience level</label>
          <select id="experience" class="input">
            <option value="">Select experience</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
      </div>
    </section>
  `;
}

function renderDashboard() {
  return `
    <section class="empty-state">
      <h1 class="empty-state__title">Dashboard</h1>
      <p class="empty-state__text">No jobs yet. In the next step, you will load a realistic dataset.</p>
    </section>
  `;
}

function renderSaved() {
  return `
    <section class="empty-state">
      <h1 class="empty-state__title">Saved</h1>
      <p class="empty-state__text">Jobs you save will appear here. Nothing saved yet.</p>
    </section>
  `;
}

function renderDigest() {
  return `
    <section class="empty-state">
      <h1 class="empty-state__title">Digest</h1>
      <p class="empty-state__text">Your daily job digest will appear here. Configure delivery in Settings.</p>
    </section>
  `;
}

function renderProof() {
  return `
    <section class="placeholder-page">
      <h1 class="placeholder-page__title">Proof</h1>
      <p class="placeholder-page__subtext">Placeholder for artifact collection.</p>
    </section>
  `;
}

function renderPage(route) {
  const container = document.getElementById('page-content');
  if (!container) return;

  const renderers = {
    landing: renderLanding,
    dashboard: renderDashboard,
    saved: renderSaved,
    digest: renderDigest,
    settings: renderSettings,
    proof: renderProof
  };

  const render = renderers[route] || renderLanding;
  container.innerHTML = render();
}

function updateNav(route) {
  document.querySelectorAll('.nav-bar__link').forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle('nav-bar__link--active', isActive);
  });
}

function closeMobileMenu() {
  const toggle = document.querySelector('.nav-bar__toggle');
  const links = document.querySelector('.nav-bar__links');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('nav-bar__links--open');
  }
}

function handleRoute() {
  const route = getRoute();
  renderPage(route);
  updateNav(route);
  closeMobileMenu();
}

function init() {
  handleRoute();

  window.addEventListener('hashchange', handleRoute);

  document.querySelector('.nav-bar__toggle')?.addEventListener('click', () => {
    const toggle = document.querySelector('.nav-bar__toggle');
    const links = document.querySelector('.nav-bar__links');
    if (toggle && links) {
      const isOpen = links.classList.toggle('nav-bar__links--open');
      toggle.setAttribute('aria-expanded', isOpen);
    }
  });

  document.querySelectorAll('.nav-bar__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) closeMobileMenu();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
