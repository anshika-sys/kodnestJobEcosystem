/**
 * Job Notification Tracker — Router & Pages
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

let currentFilters = {
  keyword: '',
  location: '',
  mode: '',
  experience: '',
  source: '',
  sort: 'latest'
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

function renderFilterBar() {
  const opts = getFilterOptions(JOBS_DATA);
  return `
    <div class="filter-bar card">
      <input type="text" class="input filter-bar__search" placeholder="Search by title or company" id="filter-keyword" value="${escapeHtml(currentFilters.keyword)}">
      <select class="input filter-bar__select" id="filter-location">
        <option value="">All locations</option>
        ${opts.locations.map((l) => `<option value="${escapeHtml(l)}" ${currentFilters.location === l ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
      </select>
      <select class="input filter-bar__select" id="filter-mode">
        <option value="">All modes</option>
        ${opts.modes.map((m) => `<option value="${escapeHtml(m)}" ${currentFilters.mode === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
      </select>
      <select class="input filter-bar__select" id="filter-experience">
        <option value="">All experience</option>
        ${opts.experiences.map((e) => `<option value="${escapeHtml(e)}" ${currentFilters.experience === e ? 'selected' : ''}>${escapeHtml(e)}</option>`).join('')}
      </select>
      <select class="input filter-bar__select" id="filter-source">
        <option value="">All sources</option>
        ${opts.sources.map((s) => `<option value="${escapeHtml(s)}" ${currentFilters.source === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
      </select>
      <select class="input filter-bar__select" id="filter-sort">
        <option value="latest" ${currentFilters.sort === 'latest' ? 'selected' : ''}>Latest</option>
        <option value="salary" ${currentFilters.sort === 'salary' ? 'selected' : ''}>Salary (low to high)</option>
      </select>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderDashboard() {
  const filtered = filterAndSortJobs(JOBS_DATA, currentFilters);
  const filterBar = renderFilterBar();
  const jobsHtml = filtered.length
    ? `<div class="job-grid">${filtered.map((j) => renderJobCard(j, { showUnsave: true })).join('')}</div>`
    : '<p class="empty-state__text">No jobs match your filters. Try adjusting the filter criteria.</p>';

  return `
    <section class="dashboard-page">
      <h1 class="dashboard-page__title">Dashboard</h1>
      <p class="dashboard-page__subtext">Browse and save jobs that match your interests.</p>
      ${filterBar}
      ${jobsHtml}
    </section>
  `;
}

function renderSaved() {
  const savedIds = getSavedIds();
  const savedJobs = JOBS_DATA.filter((j) => savedIds.includes(j.id));

  if (savedJobs.length === 0) {
    return `
      <section class="empty-state">
        <h1 class="empty-state__title">Saved</h1>
        <p class="empty-state__text">Jobs you save will appear here. Nothing saved yet.</p>
      </section>
    `;
  }

  const cards = savedJobs.map((j) => renderJobCard(j, { showUnsave: true })).join('');
  return `
    <section class="saved-page">
      <h1 class="saved-page__title">Saved</h1>
      <p class="saved-page__subtext">${savedJobs.length} job${savedJobs.length === 1 ? '' : 's'} saved.</p>
      <div class="job-grid">${cards}</div>
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
  bindPageEvents(route);
}

function bindPageEvents(route) {
  if (route === 'dashboard') {
    bindFilterEvents();
  }

  document.getElementById('page-content')?.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.js-view-job');
    const saveBtn = e.target.closest('.js-save-job');
    const unsaveBtn = e.target.closest('.js-unsave-job');

    if (viewBtn) {
      const id = parseInt(viewBtn.dataset.id, 10);
      const job = JOBS_DATA.find((j) => j.id === id);
      if (job) openModal(job);
    }
    if (saveBtn) {
      const id = parseInt(saveBtn.dataset.id, 10);
      saveJob(id);
      handleRoute();
    }
    if (unsaveBtn) {
      const id = parseInt(unsaveBtn.dataset.id, 10);
      unsaveJob(id);
      handleRoute();
    }
  });
}

function bindFilterEvents() {
  const keyword = document.getElementById('filter-keyword');
  const location = document.getElementById('filter-location');
  const mode = document.getElementById('filter-mode');
  const experience = document.getElementById('filter-experience');
  const source = document.getElementById('filter-source');
  const sort = document.getElementById('filter-sort');

  const applyFilters = () => {
    currentFilters = {
      keyword: keyword?.value?.trim() || '',
      location: location?.value || '',
      mode: mode?.value || '',
      experience: experience?.value || '',
      source: source?.value || '',
      sort: sort?.value || 'latest'
    };
    renderPage('dashboard');
  };

  keyword?.addEventListener('input', debounce(applyFilters, 200));
  location?.addEventListener('change', applyFilters);
  mode?.addEventListener('change', applyFilters);
  experience?.addEventListener('change', applyFilters);
  source?.addEventListener('change', applyFilters);
  sort?.addEventListener('change', applyFilters);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function openModal(job) {
  const container = document.getElementById('modal-container');
  if (!container) return;
  container.innerHTML = renderJobModal(job);
  container.querySelector('.modal-overlay')?.focus();

  const close = () => {
    container.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  container.querySelectorAll('.js-modal-close').forEach((el) => {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', onKey);
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
