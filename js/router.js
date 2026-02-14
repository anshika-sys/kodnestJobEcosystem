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
  sort: 'latest',
  showOnlyMatches: false
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
  const prefs = getPreferences();
  const opts = getFilterOptions(JOBS_DATA);
  const roleKeywords = escapeHtml((prefs && prefs.roleKeywords) || '');
  const skills = escapeHtml((prefs && prefs.skills) || '');
  const minScore = (prefs && prefs.minMatchScore) ?? 40;
  const expLevel = (prefs && prefs.experienceLevel) || '';
  const prefsLoc = (prefs && prefs.preferredLocations) || [];
  const prefsMode = (prefs && prefs.preferredMode) || [];

  const locOptions = opts.locations.map((l) =>
    `<option value="${escapeHtml(l)}" ${prefsLoc.includes(l) ? 'selected' : ''}>${escapeHtml(l)}</option>`
  ).join('');

  const expOptions = opts.experiences.map((e) =>
    `<option value="${escapeHtml(e)}" ${expLevel === e ? 'selected' : ''}>${escapeHtml(e)}</option>`
  ).join('');

  return `
    <section class="settings-page">
      <h1 class="settings-page__title">Settings</h1>
      <p class="settings-page__subtext">Configure your job preferences for intelligent matching.</p>
      <form class="card settings-page__form" id="settings-form">
        <div class="form-field">
          <label class="form-field__label" for="role-keywords">Role keywords</label>
          <input type="text" id="role-keywords" class="input" name="roleKeywords" placeholder="e.g. Frontend, React, SDE Intern" value="${roleKeywords}">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="preferred-locations">Preferred locations</label>
          <select id="preferred-locations" class="input" name="preferredLocations" multiple size="5">
            ${locOptions}
          </select>
          <span class="form-field__hint">Hold Ctrl/Cmd to select multiple</span>
        </div>
        <div class="form-field">
          <span class="form-field__label">Preferred mode</span>
          <div class="form-field__checkboxes">
            <label class="checkbox-label"><input type="checkbox" name="preferredMode" value="Remote" ${prefsMode.includes('Remote') ? 'checked' : ''}> Remote</label>
            <label class="checkbox-label"><input type="checkbox" name="preferredMode" value="Hybrid" ${prefsMode.includes('Hybrid') ? 'checked' : ''}> Hybrid</label>
            <label class="checkbox-label"><input type="checkbox" name="preferredMode" value="Onsite" ${prefsMode.includes('Onsite') ? 'checked' : ''}> Onsite</label>
          </div>
        </div>
        <div class="form-field">
          <label class="form-field__label" for="experience-level">Experience level</label>
          <select id="experience-level" class="input" name="experienceLevel">
            <option value="">Select experience</option>
            ${expOptions}
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label" for="skills">Skills</label>
          <input type="text" id="skills" class="input" name="skills" placeholder="e.g. React, Python, SQL" value="${skills}">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="min-match-score">Minimum match threshold: <span id="min-score-value">${minScore}</span>%</label>
          <input type="range" id="min-match-score" name="minMatchScore" min="0" max="100" value="${minScore}" class="slider">
        </div>
        <button type="submit" class="btn btn--primary">Save preferences</button>
      </form>
    </section>
  `;
}

function renderFilterBar() {
  const opts = getFilterOptions(JOBS_DATA);
  const prefs = getPreferences();
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
        <option value="match" ${currentFilters.sort === 'match' ? 'selected' : ''}>Match score</option>
        <option value="salary" ${currentFilters.sort === 'salary' ? 'selected' : ''}>Salary (low to high)</option>
      </select>
    </div>
    ${prefs ? `
    <div class="filter-toggle">
      <label class="toggle-label">
        <input type="checkbox" id="show-only-matches" ${currentFilters.showOnlyMatches ? 'checked' : ''}>
        <span>Show only jobs above my threshold</span>
      </label>
    </div>
    ` : ''}
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderDashboard() {
  const prefs = getPreferences();
  const filtered = filterAndSortJobs(JOBS_DATA, currentFilters, prefs);
  const filterBar = renderFilterBar();
  const showMatchBadge = !!prefs;
  const noPrefsBanner = !prefs
    ? '<div class="prefs-banner"><a href="#/settings">Set your preferences to activate intelligent matching.</a></div>'
    : '';

  let jobsHtml;
  if (filtered.length === 0) {
    jobsHtml = '<section class="empty-state empty-state--centered"><h2 class="empty-state__title">No matches</h2><p class="empty-state__text">No roles match your criteria. Adjust filters or lower threshold.</p></section>';
  } else {
    jobsHtml = `<div class="job-grid">${filtered.map((j) => renderJobCard(j, { showUnsave: true, showMatchBadge })).join('')}</div>`;
  }

  return `
    <section class="dashboard-page">
      <h1 class="dashboard-page__title">Dashboard</h1>
      <p class="dashboard-page__subtext">Browse and save jobs that match your interests.</p>
      ${noPrefsBanner}
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
  const prefs = getPreferences();
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!prefs) {
    return `
      <section class="digest-page digest-page--blocked">
        <h1 class="digest-page__title">Digest</h1>
        <p class="digest-page__blocked">Set preferences to generate a personalized digest.</p>
        <a href="#/settings" class="btn btn--primary">Set Preferences</a>
      </section>
    `;
  }

  const digest = getTodayDigest();
  const jobs = digest && digest.jobs ? digest.jobs : [];
  const hasDigest = digest !== null;
  const hasJobs = jobs.length > 0;

  if (!hasDigest || !hasJobs) {
    const noMatchesNote = hasDigest && !hasJobs
      ? '<p class="digest-page__blocked">No matching roles today. Check again tomorrow.</p>'
      : '';
    return `
      <section class="digest-page">
        <h1 class="digest-page__title">Digest</h1>
        <p class="digest-page__subtext">Generate your personalized 9AM digest based on your preferences.</p>
        <p class="digest-page__demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        ${noMatchesNote}
        <button type="button" class="btn btn--primary js-generate-digest">Generate Today's 9AM Digest (Simulated)</button>
      </section>
    `;
  }

  const jobsHtml = jobs.map((j) => {
    const score = j.matchScore != null ? `${j.matchScore}%` : '—';
    const scoreClass = getMatchScoreBadgeClass(j.matchScore);
    return `
      <div class="digest-job">
        <div class="digest-job__main">
          <h3 class="digest-job__title">${escapeHtml(j.title)}</h3>
          <p class="digest-job__company">${escapeHtml(j.company)}</p>
          <p class="digest-job__meta">${escapeHtml(j.location)} · ${escapeHtml(j.experience)}</p>
          <span class="match-badge ${scoreClass} digest-job__score">${score}</span>
        </div>
        <a href="${escapeHtml(j.applyUrl)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Apply</a>
      </div>
    `;
  }).join('');

  const plainText = formatDigestPlainText(jobs, todayStr);
  const mailtoBody = encodeURIComponent(plainText);
  const mailtoSubject = encodeURIComponent('My 9AM Job Digest');
  const mailtoUrl = `mailto:?subject=${mailtoSubject}&body=${mailtoBody}`;

  return `
    <section class="digest-page digest-page--has-content">
      <p class="digest-page__demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
      <div class="digest-card card">
        <h1 class="digest-card__title">Top 10 Jobs For You — 9AM Digest</h1>
        <p class="digest-card__date">${todayStr}</p>
        <div class="digest-jobs">
          ${jobsHtml}
        </div>
        <p class="digest-card__footer">This digest was generated based on your preferences.</p>
        <div class="digest-card__actions">
          <button type="button" class="btn btn--secondary js-copy-digest">Copy Digest to Clipboard</button>
          <a href="${mailtoUrl}" class="btn btn--secondary">Create Email Draft</a>
        </div>
      </div>
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
  if (route === 'settings') {
    bindSettingsEvents();
  }
  if (route === 'digest') {
    /* Digest actions handled via event delegation in page-content click handler */
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
    const genBtn = e.target.closest('.js-generate-digest');
    const copyBtn = e.target.closest('.js-copy-digest');
    if (genBtn) {
      const prefs = getPreferences();
      if (prefs) {
        getOrCreateTodayDigest(prefs);
        handleRoute();
      }
    }
    if (copyBtn) {
      const digest = getTodayDigest();
      if (digest && digest.jobs) {
        const text = formatDigestPlainText(digest.jobs, new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Digest to Clipboard'; }, 2000);
        });
      }
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
  const showOnlyMatches = document.getElementById('show-only-matches');

  const applyFilters = () => {
    currentFilters = {
      keyword: keyword?.value?.trim() || '',
      location: location?.value || '',
      mode: mode?.value || '',
      experience: experience?.value || '',
      source: source?.value || '',
      sort: sort?.value || 'latest',
      showOnlyMatches: showOnlyMatches?.checked ?? false
    };
    renderPage('dashboard');
  };

  keyword?.addEventListener('input', debounce(applyFilters, 200));
  location?.addEventListener('change', applyFilters);
  mode?.addEventListener('change', applyFilters);
  experience?.addEventListener('change', applyFilters);
  source?.addEventListener('change', applyFilters);
  sort?.addEventListener('change', applyFilters);
  showOnlyMatches?.addEventListener('change', applyFilters);
}

function bindSettingsEvents() {
  const form = document.getElementById('settings-form');
  const slider = document.getElementById('min-match-score');
  const scoreValue = document.getElementById('min-score-value');

  slider?.addEventListener('input', () => {
    if (scoreValue) scoreValue.textContent = slider.value;
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const preferredLocations = [];
    const locSelect = form.querySelector('#preferred-locations');
    if (locSelect && locSelect.selectedOptions) {
      for (const opt of locSelect.selectedOptions) {
        if (opt.value) preferredLocations.push(opt.value);
      }
    }
    const preferredMode = [];
    form.querySelectorAll('input[name="preferredMode"]:checked').forEach((cb) => {
      preferredMode.push(cb.value);
    });
    const prefs = {
      roleKeywords: fd.get('roleKeywords') || '',
      preferredLocations,
      preferredMode,
      experienceLevel: fd.get('experienceLevel') || '',
      skills: fd.get('skills') || '',
      minMatchScore: Number(fd.get('minMatchScore')) || 40
    };
    savePreferences(prefs);
    window.location.hash = '#/dashboard';
  });
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
