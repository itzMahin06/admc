/* ==========================================================================
   CALENDAR (index.html) LOGIC
   ========================================================================== */

/* ── TABS ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + target);
      panel.classList.add('active');
      panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = '';
    });
  });
});

/* ── COUNTDOWN ──
   Supports two formats so both new and previously-saved data work:
   1) datetime-local ISO strings from the admin picker, e.g. "2026-08-15T23:59"
   2) legacy free-typed "DD-MM-YYYY" or "DD-MM-YYYY HH:MM" text
   Always returns null for anything that doesn't produce a valid date, so the
   UI can show a safe fallback instead of "NaN". */
function parseCountdown(str) {
  if (!str) return null;
  str = str.trim();
  let date;
  if (str.includes('T')) {
    // datetime-local value, e.g. 2026-08-15T23:59
    date = new Date(str);
  } else {
    const [datePart, timePart] = str.split(' ');
    const parts = (datePart || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [d, m, y] = parts;
    const [h, mn] = (timePart || '23:59').split(':').map(Number);
    date = new Date(y, m - 1, d, h || 0, mn || 0, 0);
  }
  return isNaN(date.getTime()) ? null : date;
}
function formatCountdown(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { text: 'সময় শেষ', cls: 'expired' };
  const totalMins = Math.floor(diff / 60000);
  const totalHrs  = Math.floor(diff / 3600000);
  const days      = Math.floor(diff / 86400000);
  const hours     = Math.floor((diff % 86400000) / 3600000);
  const mins      = Math.floor((diff % 3600000) / 60000);
  if (totalHrs < 2) {
    const text = totalMins < 60 ? `${toBn(totalMins)}মিঃ` : `${toBn(hours)}ঘঃ ${toBn(mins)}মিঃ`;
    return { text, cls: 'critical' };
  }
  if (days < 3) {
    const text = days > 0 ? `${toBn(days)}দিন ${toBn(hours)}ঘঃ` : `${toBn(hours)}ঘঃ ${toBn(mins)}মিঃ`;
    return { text, cls: 'soon' };
  }
  return { text: `${toBn(days)}দিন ${toBn(hours)}ঘঃ`, cls: 'ok' };
}
const countdownEls = [];
function registerCountdown(el, str) {
  const target = parseCountdown(str);
  if (!target) { el.textContent = '—'; return; }
  countdownEls.push({ el, target });
  updateOne(el, target);
}
function updateOne(el, target) {
  const { text, cls } = formatCountdown(target);
  el.textContent = text;
  el.className = `countdown ${cls}`;
}
setInterval(() => countdownEls.forEach(({ el, target }) => updateOne(el, target)), 1000);

/* ── BOOKMARKS ── */
let bookmarkSet = new Set();
async function loadBookmarks() {
  bookmarkSet = new Set();
  if (currentUser && currentProfile) {
    bookmarkSet = new Set(currentProfile.bookmarks || []);
  }
}
async function toggleBookmark(uniId, btn) {
  if (!currentUser) { showAuthToast(); return; }
  const ref = db.collection('users').doc(currentUser.uid);
  const isOn = bookmarkSet.has(uniId);
  try {
    if (isOn) {
      bookmarkSet.delete(uniId);
      await ref.update({ bookmarks: firebase.firestore.FieldValue.arrayRemove(uniId) });
      showToast('বুকমার্ক থেকে সরানো হয়েছে', 'fa-bookmark');
    } else {
      bookmarkSet.add(uniId);
      await ref.update({ bookmarks: firebase.firestore.FieldValue.arrayUnion(uniId) });
      showToast('বুকমার্ক করা হয়েছে', 'fa-solid fa-bookmark');
    }
    if (currentProfile) currentProfile.bookmarks = Array.from(bookmarkSet);
    btn.classList.toggle('active', bookmarkSet.has(uniId));
    btn.innerHTML = bookmarkSet.has(uniId) ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
  } catch (e) {
    console.error(e);
    showToast('সমস্যা হয়েছে, আবার চেষ্টা করুন', 'fa-triangle-exclamation');
  }
}

/* ── BUILD ROWS ── */
function bookmarkCell(id) {
  const on = bookmarkSet.has(id);
  return `<button class="bookmark-btn ${on ? 'active' : ''}" data-uni="${id}" title="বুকমার্ক">
    <i class="fa-${on ? 'solid' : 'regular'} fa-bookmark"></i>
  </button>`;
}
function buildApplication(rows) {
  return rows.map(r => {
    const cdEl = `<span class="countdown" data-cd="${esc(r.deadlineCountdown)}"></span>`;
    const link = r.applyLink && r.applyLink !== '#'
      ? `<a href="${esc(r.applyLink)}" target="_blank" class="badge-link">${esc(r.applyLinkText || 'Apply')} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
      : `<span style="color:var(--text-muted)">${esc(r.applyLinkText) || '—'}</span>`;
    return `<tr><td>${bookmarkCell(r.id)}</td><td>${esc(r.name)}</td><td>${link}</td><td>${esc(r.deadline)}</td><td>${cdEl}</td></tr>`;
  }).join('');
}
function buildExam(rows) {
  // Group by university name so the name is shown once (rowspan), with each
  // extra unit (examUnit) and its own exam date listed underneath it.
  const groups = [];
  const indexByName = new Map();
  rows.forEach(r => {
    if (!indexByName.has(r.name)) {
      indexByName.set(r.name, groups.length);
      groups.push({ name: r.name, units: [] });
    }
    groups[indexByName.get(r.name)].units.push(r);
  });

  return groups.map(g => {
    return g.units.map((r, i) => {
      const cdEl = `<span class="countdown" data-cd="${esc(r.examCountdown)}"></span>`;
      const unitLabel = r.examUnit ? esc(r.examUnit) : (g.units.length > 1 ? `ইউনিট ${i + 1}` : '—');
      const nameCell = i === 0 ? `<td rowspan="${g.units.length}">${esc(g.name)}</td>` : '';
      return `<tr>${nameCell}<td>${unitLabel}</td><td>${esc(r.admitCard)}</td><td>${esc(r.examDate)}</td><td>${cdEl}</td></tr>`;
    }).join('');
  }).join('');
}
function buildInfo(rows) {
  return rows.map(r => {
    const yes = `<i class="fa-solid fa-circle-check icon-yes"></i>`;
    const no  = `<i class="fa-solid fa-circle-xmark icon-no"></i>`;
    const circ = r.circularLink && r.circularLink !== '#'
      ? `<a href="${esc(r.circularLink)}" target="_blank" class="badge-link">দেখুন</a>`
      : `<span style="color:var(--text-muted)">—</span>`;
    return `<tr><td>${esc(r.name)}</td><td>${esc(r.negative)}</td><td>${r.calculator ? yes : no}</td><td>${r.secondTime ? yes : no}</td><td>${circ}</td></tr>`;
  }).join('');
}
function buildResult(rows) {
  return rows.map(r => {
    const link = r.resultLink && r.resultLink !== '#'
      ? `<a href="${esc(r.resultLink)}" target="_blank" class="badge-link result">দেখুন <i class="fa-solid fa-eye"></i></a>`
      : `<span style="color:var(--text-muted)">—</span>`;
    return `<tr><td>${esc(r.name)}</td><td>${esc(r.resultDate)}</td><td>${link}</td></tr>`;
  }).join('');
}
function buildVideos(videos) {
  const slider = document.getElementById('videoSlider');
  if (!videos || !videos.length) { slider.parentElement.style.display = 'none'; return; }
  slider.innerHTML = videos.map((v, i) => `
    <a href="${esc(v.url)}" target="_blank" class="video-card" style="animation:fadeUp .5s ${.3 + i * .08}s both">
      <img src="${esc(v.thumb)}" alt="${esc(v.title)}" loading="lazy">
      <div class="video-card-title">${esc(v.title)}</div>
    </a>`).join('');
}

function attachBookmarkHandlers() {
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleBookmark(btn.dataset.uni, btn));
  });
}

/* ── LOAD DATA FROM FIRESTORE ── */
let allUniversities = [];
async function loadUniversities() {
  const snap = await db.collection('universities').orderBy('order', 'asc').get();
  allUniversities = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.active !== false);
  return allUniversities;
}

async function initCalendar() {
  try {
    await loadUniversities();
    await loadBookmarks();

    document.getElementById('body-application').innerHTML = buildApplication(allUniversities.filter(u => u.deadline));
    document.getElementById('body-exam').innerHTML        = buildExam(allUniversities.filter(u => u.examDate));
    document.getElementById('body-info').innerHTML        = buildInfo(allUniversities.filter(u => u.negative || u.circularLink));
    document.getElementById('body-result').innerHTML      = buildResult(allUniversities.filter(u => u.resultDate));

    document.querySelectorAll('[data-cd]').forEach(el => {
      if (el.dataset.cd) registerCountdown(el, el.dataset.cd);
      else el.textContent = '—';
    });
    attachBookmarkHandlers();
    wireAuthBookmarkSync();

    document.querySelectorAll('tbody tr').forEach((tr, i) => {
      tr.style.animation = `fadeUp .4s ${i * .02}s both`;
    });
  } catch (err) {
    console.error('Failed to load universities:', err);
    ['application', 'exam', 'info', 'result'].forEach(id => {
      const el = document.getElementById('body-' + id);
      if (el) el.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--accent2);padding:20px;">
        ডেটা লোড হয়নি। Firebase কনফিগারেশন চেক করুন (assets/firebase-config.js)।</td></tr>`;
    });
  }
}

/* re-sync bookmark icons once auth resolves, and show guest toast once.
   Registered from inside initCalendar (after the table/buttons exist), and
   uses onAuthReady so it still fires correctly even if Firebase resolved
   the auth state before initCalendar ran. */
let guestToastShown = false;
function wireAuthBookmarkSync() {
  onAuthReady(async (user) => {
    await loadBookmarks();
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      const on = bookmarkSet.has(btn.dataset.uni);
      btn.classList.toggle('active', on);
      btn.innerHTML = on ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
    });
    if (!user && !guestToastShown) {
      guestToastShown = true;
      setTimeout(() => showAuthToast(), 900);
    }
  });
}

document.addEventListener('DOMContentLoaded', initCalendar);
