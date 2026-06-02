/* ── cancel.js — Manage / Cancel RSVP ── */

const lookupForm = document.getElementById('lookup-form');
let currentGuest = null;

lookupForm.addEventListener('submit', e => {
  e.preventDefault();
  const emailInput = document.getElementById('lookup-email');
  const errEl = document.getElementById('lookup-error');
  const email = emailInput.value.trim();

  errEl.textContent = '';
  emailInput.classList.remove('error');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'Please enter a valid email address.';
    emailInput.classList.add('error');
    return;
  }

  const guest = findGuestByEmail(email);
  hideAll();

  if (!guest) {
    document.getElementById('notfound-section').classList.remove('hidden');
    return;
  }

  currentGuest = guest;
  renderFoundGuest(guest);
});

function renderFoundGuest(g) {
  document.getElementById('found-name').textContent    = g.name;
  document.getElementById('found-email').textContent   = g.email;
  document.getElementById('found-dietary').textContent = g.dietary || '—';
  document.getElementById('found-guests').textContent  =
    g.plusGuests > 0 ? `You + ${g.plusGuests}` : 'Just you';

  const statusEl = document.getElementById('found-status');
  if (g.status === 'attending') {
    statusEl.textContent = 'Attending ✓';
    statusEl.className = 'status-attending';
  } else if (g.status === 'declined') {
    statusEl.textContent = 'Declined';
    statusEl.className = 'status-declined';
  } else {
    statusEl.textContent = 'Cancelled';
    statusEl.className = 'status-cancelled';
  }

  const cancelBtn = document.getElementById('cancel-btn');
  const reactivateBtn = document.getElementById('reactivate-btn');
  const confirmBox = document.getElementById('cancel-confirm');

  confirmBox.classList.add('hidden');

  if (g.status === 'cancelled') {
    cancelBtn.classList.add('hidden');
    reactivateBtn.classList.remove('hidden');
  } else {
    cancelBtn.classList.remove('hidden');
    reactivateBtn.classList.add('hidden');
  }

  document.getElementById('found-section').classList.remove('hidden');
}

function hideAll() {
  ['found-section', 'notfound-section', 'cancelled-section'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

/* Cancel flow */
document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('cancel-confirm').classList.remove('hidden');
  document.getElementById('cancel-btn').classList.add('hidden');
});

document.getElementById('abort-cancel-btn').addEventListener('click', () => {
  document.getElementById('cancel-confirm').classList.add('hidden');
  document.getElementById('cancel-btn').classList.remove('hidden');
});

document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
  if (!currentGuest) return;
  updateGuestStatus(currentGuest.email, 'cancelled');
  hideAll();
  document.getElementById('cancelled-section').classList.remove('hidden');
  currentGuest = null;
});

/* Reactivate */
document.getElementById('reactivate-btn').addEventListener('click', () => {
  if (!currentGuest) return;
  const updated = updateGuestStatus(currentGuest.email, 'attending');
  if (updated) {
    currentGuest = updated;
    renderFoundGuest(updated);
  }
});

/* Pre-fill from URL hash */
(function prefillFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash && hash.includes('@')) {
    const emailInput = document.getElementById('lookup-email');
    emailInput.value = decodeURIComponent(hash);
    const guest = findGuestByEmail(emailInput.value);
    if (guest) {
      hideAll();
      currentGuest = guest;
      renderFoundGuest(guest);
      document.getElementById('lookup-section').classList.add('hidden');
    }
  }
})();
