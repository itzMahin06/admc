/* ==========================================================================
   COMMON.JS — loaded on every page (after firebase-config.js)
   Renders header/footer, handles theme, mobile nav, toast, auth-aware UI.
   ========================================================================== */

const LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCYY5WgDdWc6kowVbEWCCFwuZZgfxhKnwtZK_6YSWXFTVUjRA18HeB-xuL7aG6FVFoF-nSKmoIzaq22GzbBM4550-bE86WcxKL39hfKLTvZR0FgDW_fIvR8fMxOR9xzu30fFIve7xHIrFcbi0rLbMwEE3Zv8ZQDXx0F9pWLydZG7nPP0Rg24EptFpTEl7f/s1600/%E0%A6%8F%E0%A6%A1%E0%A6%AE%E0%A6%BF%E0%A6%B6%E0%A6%A8%20%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%A1%E0%A6%BE%E0%A6%B0_20251220_022531_0000.png";

const NAV_LINKS = [
  { href: "index.html",   label: "ক্যালেন্ডার", icon: "fa-calendar-days" },
  { href: "about.html",   label: "আমাদের সম্পর্কে", icon: "fa-circle-info" },
  { href: "privacy.html", label: "প্রাইভেসি", icon: "fa-shield-halved" },
  { href: "contact.html", label: "যোগাযোগ", icon: "fa-envelope" }
];

/* ── RENDER HEADER + FOOTER ── */
function renderChrome() {
  const path = location.pathname.split('/').pop() || 'index.html';

  document.getElementById('site-header').innerHTML = `
    <header>
      <a href="index.html" class="brand-link" title="Admission Calendar">
        <img src="${LOGO_URL}" alt="Logo">
        <span>Admission Calendar</span>
      </a>
      <nav class="main-nav">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="${path === l.href ? 'active' : ''}"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`).join('')}
      </nav>
      <div class="header-right">
        <button class="btn-icon" id="themeToggle" title="থিম পরিবর্তন" aria-label="Toggle theme">
          <i class="fa-solid fa-moon" id="themeIcon"></i>
        </button>
        <a class="btn-icon" href="profile.html#bookmarks" id="bookmarkIcon" title="বুকমার্ক">
          <i class="fa-regular fa-bookmark"></i>
        </a>
        <div class="header-menu-wrap">
          <button class="btn-icon" id="profileBtn" title="প্রোফাইল"><i class="fa-regular fa-user"></i></button>
          <div class="header-dropdown" id="profileDropdown"></div>
        </div>
        <button class="btn-icon hamburger" id="hamburgerBtn" title="মেনু"><i class="fa-solid fa-bars"></i></button>
      </div>
    </header>
    <div class="mobile-nav" id="mobileNav">
      ${NAV_LINKS.map(l => `<a href="${l.href}"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`).join('')}
    </div>
  `;

  document.getElementById('site-footer').innerHTML = `
    <footer>
      <div class="foot-links">
        <a href="about.html">আমাদের সম্পর্কে</a>
        <a href="privacy.html">প্রাইভেসি পলিসি</a>
        <a href="contact.html">যোগাযোগ</a>
      </div>
      © <span id="year"></span> <a href="https://www.youtube.com/@itzMahin" target="_blank">Mahin's Classroom</a>. All rights reserved.
    </footer>
  `;
  document.getElementById('year').textContent = new Date().getFullYear();

  wireTheme();
  wireMobileNav();
  wireProfileDropdown();
}

/* ── THEME TOGGLE ── */
function wireTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  let theme = localStorage.getItem('theme') || 'dark';
  apply(theme);
  document.getElementById('themeToggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    localStorage.setItem('theme', theme);
  });
  function apply(t) {
    html.setAttribute('data-theme', t);
    icon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/* ── MOBILE NAV ── */
function wireMobileNav() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.innerHTML = nav.classList.contains('open') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
}

/* ── PROFILE DROPDOWN ── */
function wireProfileDropdown() {
  const btn = document.getElementById('profileBtn');
  const dd = document.getElementById('profileDropdown');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dd.classList.toggle('open');
  });
  document.addEventListener('click', () => dd.classList.remove('open'));
}

function renderGuestMenu() {
  const btn = document.getElementById('profileBtn');
  btn.innerHTML = '<i class="fa-regular fa-user"></i>';
  document.getElementById('profileDropdown').innerHTML = `
    <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> সাইন ইন</a>
    <a href="register.html"><i class="fa-solid fa-user-plus"></i> রেজিস্টার</a>
  `;
  btn.onclick = (e) => { e.stopPropagation(); document.getElementById('profileDropdown').classList.toggle('open'); showAuthToast(); };
}

function renderUserMenu(user, profile) {
  const btn = document.getElementById('profileBtn');
  if (user.photoURL) {
    btn.innerHTML = `<img class="avatar-icon" src="${user.photoURL}" alt="avatar">`;
  } else {
    btn.innerHTML = `<i class="fa-solid fa-user"></i>`;
  }
  const isAdmin = user.email === ADMIN_EMAIL;
  document.getElementById('profileDropdown').innerHTML = `
    <div style="padding:8px 10px 4px;font-size:.8rem;font-weight:700;">${(profile && (profile.name || profile.username)) || user.displayName || 'ইউজার'}</div>
    <div style="padding:0 10px 8px;font-size:.72rem;color:var(--text-muted);">${user.email}</div>
    <hr>
    <a href="profile.html"><i class="fa-regular fa-id-card"></i> প্রোফাইল</a>
    <a href="profile.html#bookmarks"><i class="fa-solid fa-bookmark"></i> বুকমার্ক</a>
    ${isAdmin ? '<a href="admin.html"><i class="fa-solid fa-user-shield"></i> অ্যাডমিন প্যানেল</a>' : ''}
    <hr>
    <button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> লগ আউট</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.signOut();
    showToast('আপনি লগ আউট হয়েছেন', 'fa-circle-check');
    setTimeout(() => location.href = 'index.html', 700);
  });
}

/* ── TOAST ── */
function ensureToastStack() {
  if (!document.getElementById('toast-stack')) {
    const d = document.createElement('div');
    d.id = 'toast-stack';
    document.body.appendChild(d);
  }
  return document.getElementById('toast-stack');
}
function showToast(msg, icon = 'fa-circle-info') {
  const stack = ensureToastStack();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="fa-solid ${icon}"></i><span>${msg}</span>`;
  stack.appendChild(t);
  setTimeout(() => {
    t.classList.add('leaving');
    setTimeout(() => t.remove(), 300);
  }, 3400);
}
function showAuthToast() {
  showToast('ফুল অ্যাক্সেস ও প্রিমিয়াম ফিচারের জন্য সাইন ইন/সাইন আপ করুন', 'fa-lock');
}

/* ── AUTH STATE (global) ── */
let currentUser = null;
let currentProfile = null;
const authReadyCallbacks = [];
function onAuthReady(cb) {
  if (currentUser !== undefined && authStateResolved) cb(currentUser, currentProfile);
  else authReadyCallbacks.push(cb);
}
let authStateResolved = false;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  currentProfile = null;
  if (user) {
    try {
      const snap = await db.collection('users').doc(user.uid).get();
      currentProfile = snap.exists ? snap.data() : null;
    } catch (e) { console.error('profile fetch error', e); }
    if (document.getElementById('profileBtn')) renderUserMenu(user, currentProfile);
  } else {
    if (document.getElementById('profileBtn')) renderGuestMenu();
  }
  authStateResolved = true;
  authReadyCallbacks.splice(0).forEach(cb => cb(currentUser, currentProfile));
  document.dispatchEvent(new CustomEvent('authReady', { detail: { user, profile: currentProfile } }));
});

/* ── HELPERS ── */
function toBn(n) { return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]); }

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', renderChrome);
