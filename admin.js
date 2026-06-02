/* ── admin.js — Host Dashboard with password gate ── */

// ── Change this password ──────────────────────────────
const ADMIN_PASSWORD = 'grad2025';
// ─────────────────────────────────────────────────────

const PW_SESSION_KEY = 'rsvp_admin_auth';
let currentFilter = 'all';

/* ── Password gate ── */
function isUnlocked() {
  return sessionStorage.getItem(PW_SESSION_KEY) === '1';
}

function unlock() {
  sessionStorage.setItem(PW_SESSION_KEY, '1');
  document.getElementById('pw-gate').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  renderDashboard();
}

function lock() {
  sessionStorage.removeItem(PW_SESSION_KEY);
  document.getElementById('pw-gate').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('pw-input').value = '';
  document.getElementById('pw-error').textContent = '';
}

if (isUnlocked()) {
  unlock();
}

document.getElementById('pw-submit').addEventListener('click', checkPassword);
document.getElementById('pw-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPassword();
});

function checkPassword() {
  const val = document.getElementById('pw-input').value;
  const errEl = document.getElementById('pw-error');
  if (val === ADMIN_PASSWORD) {
    errEl.textContent = '';
    unlock();
  } else {
    errEl.textContent = 'Incorrect password. Try again.';
    document.getElementById('pw-input').select();
  }
}

document.getElementById('lock-btn').addEventListener('click', lock);

/* ── Dashboard render ── */
function renderDashboard() {
  const guests = loadGuests();

  const attending  = guests.filter(g => g.status === 'attending');
  const declined   = guests.filter(g => g.status === 'declined');
  const cancelled  = guests.filter(g => g.status === 'cancelled');
  const totalGuests = attending.reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0);

  document.getElementById('stat-attending').textContent    = attending.length;
  document.getElementById('stat-total-guests').textContent = totalGuests;
  document.getElementById('stat-declined').textContent     = declined.length;
  document.getElementById('stat-cancelled').textContent    = cancelled.length;
  document.getElementById('admin-event-title').textContent = CONFIG.eventTitle;

  let filtered = guests;
  if (currentFilter === 'attending') filtered = attending;
  else if (currentFilter === 'declined') filtered = declined;
  else if (currentFilter === 'cancelled') filtered = cancelled;

  const tbody = document.getElementById('guest-tbody');
  const empty = document.getElementById('empty-state');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .forEach(g => {
      const date = new Date(g.submittedAt);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                      ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      const badgeClass  = g.status === 'attending' ? 'attending' : g.status === 'declined' ? 'declined' : 'cancelled';
      const statusLabel = g.status === 'attending' ? 'Attending' : g.status === 'declined' ? 'Declined' : 'Cancelled';
      const plusStr = g.status === 'attending' ? (g.plusGuests > 0 ? `+${g.plusGuests}` : '—') : '—';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${esc(g.name)}</strong></td>
        <td style="color:var(--text-muted)">${esc(g.email)}</td>
        <td>${plusStr}</td>
        <td style="color:var(--text-muted);font-size:0.82rem">${esc(g.dietary) || '—'}</td>
        <td style="color:var(--text-muted);font-size:0.82rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.message) || '—'}</td>
        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
        <td style="color:var(--text-muted);font-size:0.82rem;white-space:nowrap">${dateStr}</td>
      `;
      tbody.appendChild(tr);
    });
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Filter tabs */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    if (isUnlocked()) renderDashboard();
  });
});

/* Export CSV */
document.getElementById('export-btn').addEventListener('click', () => {
  const guests = loadGuests();
  const headers = ['Name','Email','Status','Extra Guests','Dietary','Message','Submitted'];
  const rows = guests.map(g => [
    g.name, g.email, g.status, g.plusGuests || 0,
    g.dietary || '', g.message || '',
    new Date(g.submittedAt).toLocaleString()
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'rsvp-guests.csv';
  a.click(); URL.revokeObjectURL(url);
});

/* Clear all */
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Delete ALL RSVP data? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    renderDashboard();
  }
});

/* Auto-refresh every 5s while unlocked */
setInterval(() => { if (isUnlocked()) renderDashboard(); }, 5000);
