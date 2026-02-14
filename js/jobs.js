/**
 * Job Notification Tracker — Jobs Logic
 */

const STORAGE_KEY = 'job-tracker-saved-ids';

function getSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJob(id) {
  const ids = getSavedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

function unsaveJob(id) {
  const ids = getSavedIds().filter((i) => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function isSaved(id) {
  return getSavedIds().includes(id);
}

function formatPosted(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function filterAndSortJobs(jobs, filters) {
  let result = [...jobs];

  if (filters.keyword) {
    const k = filters.keyword.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(k) ||
        j.company.toLowerCase().includes(k)
    );
  }
  if (filters.location) {
    result = result.filter(
      (j) => j.location.toLowerCase() === filters.location.toLowerCase()
    );
  }
  if (filters.mode) {
    result = result.filter(
      (j) => j.mode.toLowerCase() === filters.mode.toLowerCase()
    );
  }
  if (filters.experience) {
    result = result.filter(
      (j) => j.experience.toLowerCase() === filters.experience.toLowerCase()
    );
  }
  if (filters.source) {
    result = result.filter(
      (j) => j.source.toLowerCase() === filters.source.toLowerCase()
    );
  }

  if (filters.sort === 'salary') {
    const order = { '₹15k': 0, '3–5': 1, '6–10': 2, '10–18': 3 };
    result.sort((a, b) => {
      const sa = Object.keys(order).find((k) => a.salaryRange.startsWith(k));
      const sb = Object.keys(order).find((k) => b.salaryRange.startsWith(k));
      return (order[sa] ?? -1) - (order[sb] ?? -1);
    });
  } else {
    result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  }

  return result;
}

function getFilterOptions(jobs) {
  const locations = [...new Set(jobs.map((j) => j.location))].sort();
  const modes = [...new Set(jobs.map((j) => j.mode))].sort();
  const experiences = [...new Set(jobs.map((j) => j.experience))].sort();
  const sources = [...new Set(jobs.map((j) => j.source))].sort();
  return { locations, modes, experiences, sources };
}

function renderJobCard(job, options = {}) {
  const saved = isSaved(job.id);
  const showUnsave = options.showUnsave ?? false;

  return `
    <article class="job-card card" data-id="${job.id}">
      <div class="job-card__header">
        <h3 class="job-card__title">${escapeHtml(job.title)}</h3>
        <span class="job-card__source badge badge--not-started">${escapeHtml(job.source)}</span>
      </div>
      <p class="job-card__company">${escapeHtml(job.company)}</p>
      <div class="job-card__meta">
        <span>${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</span>
        <span>${escapeHtml(job.experience)}</span>
      </div>
      <p class="job-card__salary">${escapeHtml(job.salaryRange)}</p>
      <p class="job-card__posted text-caption">${formatPosted(job.postedDaysAgo)}</p>
      <div class="job-card__actions">
        <button type="button" class="btn btn--secondary btn--sm js-view-job" data-id="${job.id}">View</button>
        ${showUnsave && saved
          ? `<button type="button" class="btn btn--secondary btn--sm js-unsave-job" data-id="${job.id}">Unsave</button>`
          : !saved
          ? `<button type="button" class="btn btn--secondary btn--sm js-save-job" data-id="${job.id}">Save</button>`
          : ''}
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Apply</a>
      </div>
    </article>
  `;
}

function renderJobModal(job) {
  const skills = job.skills.map((s) => escapeHtml(s)).join(', ');
  return `
    <div class="modal-overlay js-modal-close" role="button" tabindex="0" aria-label="Close">
      <div class="modal card" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()">
        <h2 id="modal-title" class="modal__title">${escapeHtml(job.title)}</h2>
        <p class="modal__company">${escapeHtml(job.company)}</p>
        <p class="modal__description">${escapeHtml(job.description)}</p>
        <p class="modal__skills"><strong>Skills:</strong> ${skills}</p>
        <button type="button" class="btn btn--primary modal__close js-modal-close">Close</button>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
