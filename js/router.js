/**
 * Job Notification Tracker — Route Skeleton
 * Hash-based routing for static deployment
 */

const ROUTES = {
  '': 'dashboard',
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/saved': 'saved',
  '/digest': 'digest',
  '/settings': 'settings',
  '/proof': 'proof'
};

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  saved: 'Saved',
  digest: 'Digest',
  settings: 'Settings',
  proof: 'Proof'
};

function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return ROUTES[hash] || 'dashboard';
}

function renderPage(route) {
  const container = document.getElementById('page-content');
  if (!container) return;

  const title = PAGE_TITLES[route] || 'Dashboard';
  container.innerHTML = `
    <section class="placeholder-page">
      <h1 class="placeholder-page__title">${title}</h1>
      <p class="placeholder-page__subtext">This section will be built in the next step.</p>
    </section>
  `;
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
