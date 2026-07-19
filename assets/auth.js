/* ==========================================================================
   AUTH.JS — shared by login.html & register.html
   ========================================================================== */

function showFormMsg(el, msg, type) {
  el.textContent = msg;
  el.className = `form-msg show ${type}`;
}
function hideFormMsg(el) {
  el.className = 'form-msg';
}

function friendlyAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
    'auth/invalid-email': 'ইমেইল ঠিকানা সঠিক নয়।',
    'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।',
    'auth/user-not-found': 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
    'auth/wrong-password': 'পাসওয়ার্ড সঠিক নয়।',
    'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
    'auth/too-many-requests': 'অনেকবার চেষ্টা করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।',
    'auth/popup-closed-by-user': 'পপআপ বন্ধ করে দেওয়া হয়েছে।'
  };
  return map[code] || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।';
}

/* Create the Firestore user doc if it doesn't already exist */
async function ensureUserDoc(user, extra = {}) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      name: extra.name || user.displayName || '',
      username: extra.username || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      sscGPA: extra.sscGPA ?? null,
      hscGPA: extra.hscGPA ?? null,
      sscMark: extra.sscMark ?? null,
      hscMark: extra.hscMark ?? null,
      bookmarks: [],
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
      profileComplete: !!(extra.sscGPA && extra.hscGPA && extra.username),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true; // newly created
  }
  return false;
}

async function isUsernameTaken(username) {
  if (!username) return false;
  const snap = await db.collection('users').where('username', '==', username).limit(1).get();
  return !snap.empty;
}

/* ── REGISTER FORM ── */
function wireRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  const msgEl = document.getElementById('formMsg');
  const submitBtn = document.getElementById('registerBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormMsg(msgEl);

    const name     = form.name.value.trim();
    const username = form.username.value.trim().toLowerCase().replace(/\s+/g, '');
    const sscGPA   = parseFloat(form.sscGPA.value);
    const hscGPA   = parseFloat(form.hscGPA.value);
    const email    = form.email.value.trim();
    const password = form.password.value;

    if (!name || !username || !email || !password) {
      showFormMsg(msgEl, 'সকল ঘর পূরণ করুন।', 'error'); return;
    }
    if (password.length < 6) {
      showFormMsg(msgEl, 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।', 'error'); return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> প্রসেস হচ্ছে...';

    try {
      if (await isUsernameTaken(username)) {
        showFormMsg(msgEl, 'এই ইউজারনেমটি আগে থেকে ব্যবহৃত হয়েছে, অন্যটি চেষ্টা করুন।', 'error');
        return;
      }
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      await ensureUserDoc(cred.user, { name, username, sscGPA, hscGPA });
      showFormMsg(msgEl, 'অ্যাকাউন্ট তৈরি হয়েছে! রিডাইরেক্ট করা হচ্ছে...', 'success');
      setTimeout(() => location.href = 'profile.html', 900);
    } catch (err) {
      console.error(err);
      showFormMsg(msgEl, friendlyAuthError(err.code), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'রেজিস্টার করুন';
    }
  });

  const gBtn = document.getElementById('googleBtn');
  if (gBtn) gBtn.addEventListener('click', () => googleSignIn(msgEl));
}

/* ── LOGIN FORM ── */
function wireLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const msgEl = document.getElementById('formMsg');
  const submitBtn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormMsg(msgEl);
    const email = form.email.value.trim();
    const password = form.password.value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> সাইন ইন হচ্ছে...';
    try {
      await auth.signInWithEmailAndPassword(email, password);
      showFormMsg(msgEl, 'সফলভাবে সাইন ইন হয়েছে! রিডাইরেক্ট করা হচ্ছে...', 'success');
      const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
      setTimeout(() => location.href = redirect, 700);
    } catch (err) {
      console.error(err);
      showFormMsg(msgEl, friendlyAuthError(err.code), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'সাইন ইন করুন';
    }
  });

  const gBtn = document.getElementById('googleBtn');
  if (gBtn) gBtn.addEventListener('click', () => googleSignIn(msgEl));
}

async function googleSignIn(msgEl) {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const isNew = await ensureUserDoc(result.user);
    if (msgEl) showFormMsg(msgEl, 'সফলভাবে সাইন ইন হয়েছে! রিডাইরেক্ট করা হচ্ছে...', 'success');
    setTimeout(() => location.href = isNew ? 'profile.html?complete=1' : (new URLSearchParams(location.search).get('redirect') || 'index.html'), 700);
  } catch (err) {
    console.error(err);
    if (msgEl) showFormMsg(msgEl, friendlyAuthError(err.code), 'error');
  }
}

/* Redirect away from login/register if already signed in */
document.addEventListener('authReady', (e) => {
  if (e.detail.user && (document.getElementById('loginForm') || document.getElementById('registerForm'))) {
    location.href = 'profile.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  wireLoginForm();
  wireRegisterForm();
});
