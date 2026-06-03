/* ── admin.js — Host Dashboard (Supabase) ── */

const ADMIN_PASSWORD = 'grad2025';
const PW_SESSION_KEY = 'rsvp_admin_auth';
let currentFilter = 'all';

function isUnlocked() { return sessionStorage.getItem(PW_SESSION_KEY) === '1'; }

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

if (isUnlocked()) unlock();

document.getElementById('pw-submit').addEventListener('click', checkPassword);
document.getElementById('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });

function checkPassword() {
  const val   = document.getElementById('pw-input').value;
  const errEl = document.getElementById('pw-error');
  if (val === ADMIN_PASSWORD) { errEl.textContent = ''; unlock(); }
  else { errEl.textContent = 'Incorrect password. Try again.'; document.getElementById('pw-input').select(); }
}

document.getElementById('lock-btn').addEventListener('click', lock);

/* ── Dashboard ── */
async function renderDashboard() {
  document.getElementById('admin-event-title').textContent = CONFIG.eventTitle;

  const guests = await loadGuests();

  const attending  = guests.filter(g => g.status === 'attending');
  const declined   = guests.filter(g => g.status === 'declined');
  const cancelled  = guests.filter(g => g.status === 'cancelled');
  const totalPeople = attending.reduce((sum, g) => sum + 1 + (g.plus_guests || 0), 0);

  document.getElementById('stat-attending').textContent    = attending.length;
  document.getElementById('stat-total-guests').textContent = totalPeople;
  document.getElementById('stat-declined').textContent     = declined.length;
  document.getElementById('stat-cancelled').textContent    = cancelled.length;

  let filtered = guests;
  if (currentFilter === 'attending') filtered = attending;
  else if (currentFilter === 'declined') filtered = declined;
  else if (currentFilter === 'cancelled') filtered = cancelled;

  const tbody = document.getElementById('guest-tbody');
  const empty = document.getElementById('empty-state');
  tbody.innerHTML = '';

  if (filtered.length === 0) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  filtered.forEach(g => {
    const date    = new Date(g.created_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                    ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const badge   = g.status === 'attending' ? 'attending' : g.status === 'declined' ? 'declined' : 'cancelled';
    const label   = g.status === 'attending' ? 'Attending' : g.status === 'declined' ? 'Declined' : 'Cancelled';
    const plus    = g.status === 'attending' ? (g.plus_guests > 0 ? `+${g.plus_guests}` : '—') : '—';

    const tr = document.createElement('tr');
    tr.dataset.id = g.id;
    tr.innerHTML = `
      <td><strong>${esc(g.name)}</strong></td>
      <td style="color:var(--text-muted)">${esc(g.email)}</td>
      <td>${plus}</td>
      <td style="color:var(--text-muted);font-size:.82rem">${esc(g.dietary)||'—'}</td>
      <td style="color:var(--text-muted);font-size:.82rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.message)||'—'}</td>
      <td><span class="badge ${badge}">${label}</span></td>
      <td style="color:var(--text-muted);font-size:.82rem;white-space:nowrap">${dateStr}</td>
      <td><button class="btn-delete" data-id="${g.id}" data-name="${esc(g.name)}" title="Delete guest">✕</button></td>`;
    tbody.appendChild(tr);
  });
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Delete guest */
document.getElementById('guest-tbody').addEventListener('click', async e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const name = btn.dataset.name;
  const id   = btn.dataset.id;
  if (!confirm(`Remove ${name} from the guest list? This cannot be undone.`)) return;
  btn.textContent = '…';
  btn.disabled = true;
  const { error } = await getDB().from('rsvps').delete().eq('id', id);
  if (error) {
    alert('Could not delete. Please try again.');
    btn.textContent = '✕';
    btn.disabled = false;
  } else {
    btn.closest('tr').remove();
    renderDashboard();
  }
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    if (isUnlocked()) renderDashboard();
  });
});

document.getElementById('export-btn').addEventListener('click', async () => {
  const guests  = await loadGuests();
  const headers = ['Name','Email','Status','Extra Guests','Dietary','Message','Submitted'];
  const rows    = guests.map(g => [
    g.name, g.email, g.status, g.plus_guests || 0,
    g.dietary || '', g.message || '',
    new Date(g.created_at).toLocaleString()
  ]);
  const csv  = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'rsvp-guests.csv'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('clear-btn').addEventListener('click', async () => {
  if (!confirm('Delete ALL RSVP data from the database? This cannot be undone.')) return;
  await getDB().from('rsvps').delete().neq('id', 0);
  renderDashboard();
});

/* Auto-refresh every 15s */
setInterval(() => { if (isUnlocked()) renderDashboard(); }, 15000);
