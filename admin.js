/* ── admin.js — Host Dashboard ── */

let currentFilter = 'all';

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

  const adminTitle = document.getElementById('admin-event-title');
  if (adminTitle) adminTitle.textContent = CONFIG.eventTitle;

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

      const badgeClass = g.status === 'attending' ? 'attending'
                        : g.status === 'declined'  ? 'declined'
                        : 'cancelled';

      const statusLabel = g.status === 'attending' ? 'Attending'
                        : g.status === 'declined'  ? 'Declined'
                        : 'Cancelled';

      const plusStr = g.status === 'attending'
        ? (g.plusGuests > 0 ? `+${g.plusGuests}` : '—')
        : '—';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${esc(g.name)}</strong></td>
        <td style="color: var(--text-muted)">${esc(g.email)}</td>
        <td>${plusStr}</td>
        <td style="color: var(--text-muted); font-size: 0.82rem">${esc(g.dietary) || '—'}</td>
        <td style="color: var(--text-muted); font-size: 0.82rem; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${esc(g.message) || '—'}</td>
        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
        <td style="color: var(--text-muted); font-size: 0.82rem; white-space: nowrap">${dateStr}</td>
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
    renderDashboard();
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

renderDashboard();
setInterval(renderDashboard, 5000); // auto-refresh
