/**
 * Job Notification Tracker — Jobs Logic
 */

const STORAGE_KEY = 'job-tracker-saved-ids';
const PREFERENCES_KEY = 'jobTrackerPreferences';

const DEFAULT_PREFERENCES = {
  roleKeywords: '',
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: '',
  skills: '',
  minMatchScore: 40
};

function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      minMatchScore: Math.min(100, Math.max(0, parsed.minMatchScore ?? 40))
    };
  } catch {
    return null;
  }
}

function savePreferences(prefs) {
  const normalized = {
    roleKeywords: String(prefs.roleKeywords ?? '').trim(),
    preferredLocations: Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [],
    preferredMode: Array.isArray(prefs.preferredMode) ? prefs.preferredMode : [],
    experienceLevel: String(prefs.experienceLevel ?? '').trim(),
    skills: String(prefs.skills ?? '').trim(),
    minMatchScore: Math.min(100, Math.max(0, Number(prefs.minMatchScore) || 40))
  };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalized));
  return normalized;
}

function parseCommaList(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Match score engine — deterministic rules per specification:
 * +25 any roleKeyword in job.title (case-insensitive)
 * +15 any roleKeyword in job.description
 * +15 job.location in preferredLocations
 * +10 job.mode in preferredMode
 * +10 job.experience matches experienceLevel
 * +15 overlap between job.skills and user skills (any match)
 * +5 if postedDaysAgo <= 2
 * +5 if source is LinkedIn
 * Cap at 100
 */
function computeMatchScore(job, prefs) {
  if (!prefs) return null;

  let score = 0;
  const roleKeywords = parseCommaList(prefs.roleKeywords);
  const userSkills = parseCommaList(prefs.skills);
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

  if (roleKeywords.length) {
    for (const kw of roleKeywords) {
      if (titleLower.includes(kw)) {
        score += 25;
        break;
      }
    }
  }

  if (roleKeywords.length) {
    for (const kw of roleKeywords) {
      if (descLower.includes(kw)) {
        score += 15;
        break;
      }
    }
  }

  const prefsLoc = (prefs.preferredLocations || []).map((l) => String(l).toLowerCase());
  if (prefsLoc.length && prefsLoc.includes((job.location || '').toLowerCase())) {
    score += 15;
  }

  const prefsMode = (prefs.preferredMode || []).map((m) => String(m).toLowerCase());
  if (prefsMode.length && prefsMode.includes((job.mode || '').toLowerCase())) {
    score += 10;
  }

  if (prefs.experienceLevel && String(job.experience || '').toLowerCase() === String(prefs.experienceLevel).toLowerCase()) {
    score += 10;
  }

  if (userSkills.length && job.skills && Array.isArray(job.skills)) {
    const jobSkills = job.skills.map((s) => String(s).toLowerCase());
    const overlap = userSkills.some((us) => jobSkills.some((js) => js === us || js.includes(us) || us.includes(js)));
    if (overlap) score += 15;
  }

  if ((job.postedDaysAgo ?? 99) <= 2) {
    score += 5;
  }

  if (String(job.source || '').toLowerCase() === 'linkedin') {
    score += 5;
  }

  return Math.min(100, score);
}

function getMatchScoreBadgeClass(score) {
  if (score == null) return 'match-badge--none';
  if (score >= 80) return 'match-badge--high';
  if (score >= 60) return 'match-badge--medium';
  if (score >= 40) return 'match-badge--low';
  return 'match-badge--minimal';
}

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

function filterAndSortJobs(jobs, filters, prefs) {
  let result = jobs.map((j) => ({
    ...j,
    matchScore: computeMatchScore(j, prefs)
  }));

  if (filters.showOnlyMatches && prefs) {
    const threshold = prefs.minMatchScore ?? 40;
    result = result.filter((j) => j.matchScore != null && j.matchScore >= threshold);
  }

  if (filters.keyword) {
    const k = filters.keyword.toLowerCase();
    result = result.filter(
      (j) =>
        (j.title || '').toLowerCase().includes(k) ||
        (j.company || '').toLowerCase().includes(k)
    );
  }
  if (filters.location) {
    result = result.filter(
      (j) => (j.location || '').toLowerCase() === filters.location.toLowerCase()
    );
  }
  if (filters.mode) {
    result = result.filter(
      (j) => (j.mode || '').toLowerCase() === filters.mode.toLowerCase()
    );
  }
  if (filters.experience) {
    result = result.filter(
      (j) => (j.experience || '').toLowerCase() === filters.experience.toLowerCase()
    );
  }
  if (filters.source) {
    result = result.filter(
      (j) => (j.source || '').toLowerCase() === filters.source.toLowerCase()
    );
  }

  if (filters.sort === 'match') {
    result.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
  } else if (filters.sort === 'salary') {
    const salaryOrder = (sr) => {
      if (!sr) return -1;
      if (sr.startsWith('₹')) return 0;
      if (sr.startsWith('3–5') || sr.startsWith('3-5')) return 1;
      if (sr.startsWith('6–10') || sr.startsWith('6-10')) return 2;
      if (sr.startsWith('10–18') || sr.startsWith('10-18')) return 3;
      return -1;
    };
    result.sort((a, b) => salaryOrder(a.salaryRange) - salaryOrder(b.salaryRange));
  } else {
    result.sort((a, b) => (a.postedDaysAgo ?? 99) - (b.postedDaysAgo ?? 99));
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
  const matchScore = job.matchScore;
  const showMatchBadge = options.showMatchBadge ?? false;
  const scoreBadgeClass = getMatchScoreBadgeClass(matchScore);
  const scoreBadgeHtml = showMatchBadge && matchScore != null
    ? `<span class="match-badge ${scoreBadgeClass}">${matchScore}%</span>`
    : showMatchBadge
    ? `<span class="match-badge match-badge--none">—</span>`
    : '';

  return `
    <article class="job-card card" data-id="${job.id}">
      <div class="job-card__header">
        <h3 class="job-card__title">${escapeHtml(job.title)}</h3>
        <div class="job-card__badges">
          ${scoreBadgeHtml}
          <span class="job-card__source badge badge--not-started">${escapeHtml(job.source)}</span>
        </div>
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
