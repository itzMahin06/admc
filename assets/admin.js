/* ==========================================================================
   ADMIN.JS — protected by ADMIN_EMAIL check
   ========================================================================== */

function guardAdmin() {
  onAuthReady((user) => {
    if (!user) {
      showToast('অ্যাডমিন প্যানেল দেখতে সাইন ইন করুন', 'fa-lock');
      setTimeout(() => location.href = 'login.html?redirect=admin.html', 900);
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      showToast('এই পেজে প্রবেশের অনুমতি নেই', 'fa-ban');
      setTimeout(() => location.href = 'index.html', 900);
      return;
    }
    document.getElementById('adminLoading').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    initAdmin();
  });
}

/* ── TAB SWITCH ── */
function wireAdminTabs() {
  document.querySelectorAll('.a-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.a-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('asec-' + btn.dataset.target).classList.add('active');
    });
  });
}

/* ==========================================================================
   UNIVERSITIES CRUD
   ========================================================================== */
let uniCache = [];

async function loadUniAdmin() {
  const snap = await db.collection('universities').orderBy('order', 'asc').get();
  uniCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderUniTable(uniCache);
}

function renderUniTable(list) {
  const tbody = document.getElementById('uniTableBody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">কোনো বিশ্ববিদ্যালয় পাওয়া যায়নি।</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${esc(u.name)}</strong>${u.examUnit ? `<br><span style="font-size:.72rem;color:var(--text-muted);">${esc(u.examUnit)}</span>` : ''}</td>
      <td>${esc(u.deadline) || '—'}</td>
      <td>${esc(u.examDate) || '—'}</td>
      <td>${u.requiredGPA || '—'}</td>
      <td>${u.active !== false ? '<span class="chip on">সক্রিয়</span>' : '<span class="chip off">নিষ্ক্রিয়</span>'}</td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-outline btn-sm edit-uni" data-id="${u.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm del-uni" data-id="${u.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('.edit-uni').forEach(b => b.addEventListener('click', () => openUniModal(b.dataset.id)));
  tbody.querySelectorAll('.del-uni').forEach(b => b.addEventListener('click', () => deleteUni(b.dataset.id)));
}

function wireUniFilter() {
  document.getElementById('uniSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderUniTable(uniCache.filter(u => u.name.toLowerCase().includes(q)));
  });
  document.getElementById('addUniBtn').addEventListener('click', () => openUniModal(null));
}

function openUniModal(id) {
  const modal = document.getElementById('uniModal');
  const form = document.getElementById('uniForm');
  form.reset();
  const uni = id ? uniCache.find(u => u.id === id) : null;
  document.getElementById('uniModalTitle').textContent = uni ? `সম্পাদনা করুনঃ ${uni.name}` : 'নতুন বিশ্ববিদ্যালয় যোগ করুন';
  form.dataset.editId = id || '';

  form.name.value = uni?.name || '';
  form.applyLink.value = uni?.applyLink || '';
  form.applyLinkText.value = uni?.applyLinkText || 'Apply';
  form.deadline.value = uni?.deadline || '';
  form.deadlineCountdown.value = uni?.deadlineCountdown || '';
  form.examUnit.value = uni?.examUnit || '';
  form.admitCard.value = uni?.admitCard || '';
  form.examDate.value = uni?.examDate || '';
  form.examCountdown.value = uni?.examCountdown || '';
  form.negative.value = uni?.negative || '';
  form.calculator.checked = !!uni?.calculator;
  form.secondTime.checked = !!uni?.secondTime;
  form.circularLink.value = uni?.circularLink || '';
  form.resultDate.value = uni?.resultDate || '';
  form.resultLink.value = uni?.resultLink || '';
  form.requiredGPA.value = uni?.requiredGPA ?? '';
  form.active.checked = uni ? uni.active !== false : true;

  modal.classList.add('open');
}
function closeUniModal() { document.getElementById('uniModal').classList.remove('open'); }

async function saveUni(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('uniSaveBtn');
  const editId = form.dataset.editId;

  const data = {
    name: form.name.value.trim(),
    applyLink: form.applyLink.value.trim() || '#',
    applyLinkText: form.applyLinkText.value.trim() || 'Apply',
    deadline: form.deadline.value.trim(),
    deadlineCountdown: form.deadlineCountdown.value.trim(),
    examUnit: form.examUnit.value.trim(),
    admitCard: form.admitCard.value.trim(),
    examDate: form.examDate.value.trim(),
    examCountdown: form.examCountdown.value.trim(),
    negative: form.negative.value.trim(),
    calculator: form.calculator.checked,
    secondTime: form.secondTime.checked,
    circularLink: form.circularLink.value.trim() || '#',
    resultDate: form.resultDate.value.trim(),
    resultLink: form.resultLink.value.trim() || '#',
    requiredGPA: form.requiredGPA.value ? parseFloat(form.requiredGPA.value) : 0,
    active: form.active.checked
  };
  if (!data.name) { showToast('নাম আবশ্যক', 'fa-triangle-exclamation'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> সেভ হচ্ছে...';
  try {
    if (editId) {
      await db.collection('universities').doc(editId).update(data);
      showToast('আপডেট করা হয়েছে', 'fa-circle-check');
    } else {
      data.order = uniCache.length;
      await db.collection('universities').add(data);
      showToast('যোগ করা হয়েছে', 'fa-circle-check');
    }
    closeUniModal();
    await loadUniAdmin();
  } catch (err) {
    console.error(err);
    showToast('সেভ করতে সমস্যা হয়েছে', 'fa-triangle-exclamation');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'সংরক্ষণ করুন';
  }
}

async function deleteUni(id) {
  const uni = uniCache.find(u => u.id === id);
  if (!confirm(`"${uni?.name}" মুছে ফেলতে চান?`)) return;
  try {
    await db.collection('universities').doc(id).delete();
    showToast('মুছে ফেলা হয়েছে', 'fa-trash');
    await loadUniAdmin();
  } catch (err) {
    console.error(err);
    showToast('মুছতে সমস্যা হয়েছে', 'fa-triangle-exclamation');
  }
}

/* ==========================================================================
   USERS MANAGEMENT
   ========================================================================== */
let userCache = [];

async function loadUsersAdmin() {
  const snap = await db.collection('users').get();
  userCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderUserTable(userCache);
}

function renderUserTable(list) {
  const tbody = document.getElementById('userTableBody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">কোনো ইউজার পাওয়া যায়নি।</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${esc(u.name || '—')}</strong><br><span style="font-size:.72rem;color:var(--text-muted);">@${esc(u.username || '—')}</span></td>
      <td>${esc(u.email)}</td>
      <td>${u.sscGPA ?? '—'} / ${u.hscGPA ?? '—'}</td>
      <td>${(u.bookmarks || []).length}</td>
      <td>${u.role === 'admin' ? '<span class="chip on">অ্যাডমিন</span>' : '<span class="chip">ইউজার</span>'}</td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-outline btn-sm edit-user" data-id="${u.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm del-user" data-id="${u.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('.edit-user').forEach(b => b.addEventListener('click', () => openUserModal(b.dataset.id)));
  tbody.querySelectorAll('.del-user').forEach(b => b.addEventListener('click', () => deleteUser(b.dataset.id)));
}

function wireUserFilter() {
  document.getElementById('userSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderUserTable(userCache.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    ));
  });
  document.getElementById('addUserBtn').addEventListener('click', () => openUserModal(null));
}

function openUserModal(id) {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  form.reset();
  const u = id ? userCache.find(x => x.id === id) : null;
  document.getElementById('userModalTitle').textContent = u ? `সম্পাদনা করুনঃ ${u.name || u.email}` : 'নতুন ইউজার প্রোফাইল যোগ করুন';
  form.dataset.editId = id || '';
  document.getElementById('userIdField').style.display = u ? 'none' : 'block';

  form.uid.value = '';
  form.name.value = u?.name || '';
  form.username.value = u?.username || '';
  form.email.value = u?.email || '';
  form.sscGPA.value = u?.sscGPA ?? '';
  form.hscGPA.value = u?.hscGPA ?? '';
  form.sscMark.value = u?.sscMark ?? '';
  form.hscMark.value = u?.hscMark ?? '';
  form.role.value = u?.role || 'user';

  modal.classList.add('open');
}
function closeUserModal() { document.getElementById('userModal').classList.remove('open'); }

async function saveUser(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('userSaveBtn');
  const editId = form.dataset.editId;

  const data = {
    name: form.name.value.trim(),
    username: form.username.value.trim().toLowerCase(),
    email: form.email.value.trim(),
    sscGPA: form.sscGPA.value ? parseFloat(form.sscGPA.value) : null,
    hscGPA: form.hscGPA.value ? parseFloat(form.hscGPA.value) : null,
    sscMark: form.sscMark.value ? parseFloat(form.sscMark.value) : null,
    hscMark: form.hscMark.value ? parseFloat(form.hscMark.value) : null,
    role: form.role.value
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> সেভ হচ্ছে...';
  try {
    if (editId) {
      await db.collection('users').doc(editId).update(data);
      showToast('ইউজার আপডেট হয়েছে', 'fa-circle-check');
    } else {
      const uid = form.uid.value.trim();
      if (!uid) { showToast('নতুন প্রোফাইল যোগ করতে ইউজারের Firebase UID দিন। (নতুন অ্যাকাউন্ট সাধারণত রেজিস্ট্রেশন পেজ থেকেই তৈরি হয়)', 'fa-triangle-exclamation'); btn.disabled = false; btn.innerHTML = 'সংরক্ষণ করুন'; return; }
      data.bookmarks = [];
      data.profileComplete = false;
      await db.collection('users').doc(uid).set(data, { merge: true });
      showToast('প্রোফাইল যোগ করা হয়েছে', 'fa-circle-check');
    }
    closeUserModal();
    await loadUsersAdmin();
  } catch (err) {
    console.error(err);
    showToast('সেভ করতে সমস্যা হয়েছে', 'fa-triangle-exclamation');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'সংরক্ষণ করুন';
  }
}

async function deleteUser(id) {
  const u = userCache.find(x => x.id === id);
  if (!confirm(`"${u?.name || u?.email}" এর প্রোফাইল ডাটা মুছে ফেলতে চান?\n(নোটঃ এটি শুধু প্রোফাইল ডাটা মুছবে, Firebase Authentication অ্যাকাউন্ট মুছতে হলে Cloud Function প্রয়োজন — README দেখুন)`)) return;
  try {
    await db.collection('users').doc(id).delete();
    showToast('প্রোফাইল মুছে ফেলা হয়েছে', 'fa-trash');
    await loadUsersAdmin();
  } catch (err) {
    console.error(err);
    showToast('মুছতে সমস্যা হয়েছে', 'fa-triangle-exclamation');
  }
}

/* ==========================================================================
   INIT
   ========================================================================== */
function initAdmin() {
  wireAdminTabs();
  wireUniFilter();
  wireUserFilter();
  document.getElementById('uniForm').addEventListener('submit', saveUni);
  document.getElementById('userForm').addEventListener('submit', saveUser);
  document.getElementById('uniModalClose').addEventListener('click', closeUniModal);
  document.getElementById('userModalClose').addEventListener('click', closeUserModal);
  loadUniAdmin();
  loadUsersAdmin();
}

document.addEventListener('DOMContentLoaded', guardAdmin);
