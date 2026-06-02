/* ── RSVP App — Shared Storage & Form Logic ── */

const CONFIG = {
  eventTitle:    'Summer Garden Party',
  eventDate:     'Saturday, July 19 · 4:00 PM',
  eventLocation: '123 Rose Garden Lane',
};

/* ─ Storage helpers ─ */
const STORAGE_KEY = 'rsvp_guests';

function loadGuests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveGuests(guests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
}

function findGuestByEmail(email) {
  return loadGuests().find(g => g.email.toLowerCase() === email.toLowerCase());
}

function upsertGuest(data) {
  const guests = loadGuests();
  const idx = guests.findIndex(g => g.email.toLowerCase() === data.email.toLowerCase());
  if (idx >= 0) {
    guests[idx] = { ...guests[idx], ...data };
  } else {
    guests.push({ ...data, id: Date.now().toString(36), submittedAt: new Date().toISOString() });
  }
  saveGuests(guests);
}

function updateGuestStatus(email, status) {
  const guests = loadGuests();
  const idx = guests.findIndex(g => g.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) {
    guests[idx].status = status;
    guests[idx].updatedAt = new Date().toISOString();
    saveGuests(guests);
    return guests[idx];
  }
  return null;
}

/* ─ Event detail injection ─ */
function injectEventDetails() {
  const t = document.getElementById('event-title');
  const d = document.getElementById('event-date');
  const l = document.getElementById('event-location');
  if (t) t.textContent = CONFIG.eventTitle;
  if (d) d.textContent = CONFIG.eventDate;
  if (l) l.textContent = CONFIG.eventLocation;
}
injectEventDetails();

/* ─ RSVP Form ─ */
const form = document.getElementById('rsvp-form');
if (form) {
  const attendingRadios = form.querySelectorAll('input[name="attending"]');
  const attendingFields = form.querySelectorAll('.attending-only');

  function updateAttendingVisibility() {
    const attending = form.querySelector('input[name="attending"]:checked').value === 'yes';
    attendingFields.forEach(el => {
      el.classList.toggle('hidden-field', !attending);
    });
  }

  attendingRadios.forEach(r => r.addEventListener('change', updateAttendingVisibility));
  updateAttendingVisibility();

  function validate() {
    let ok = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const nameErr = document.getElementById('name-error');
    const emailErr = document.getElementById('email-error');

    nameErr.textContent = '';
    emailErr.textContent = '';
    name.classList.remove('error');
    email.classList.remove('error');

    if (!name.value.trim()) {
      nameErr.textContent = 'Please enter your name.';
      name.classList.add('error');
      ok = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailErr.textContent = 'Please enter a valid email address.';
      email.classList.add('error');
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const attending = form.querySelector('input[name="attending"]:checked').value === 'yes';
    const guestData = {
      name:     document.getElementById('name').value.trim(),
      email:    document.getElementById('email').value.trim(),
      attending: attending,
      status:   attending ? 'attending' : 'declined',
      plusGuests: attending ? parseInt(document.getElementById('guests').value, 10) : 0,
      dietary:  attending ? document.getElementById('dietary').value.trim() : '',
      message:  attending ? document.getElementById('message').value.trim() : '',
    };

    upsertGuest(guestData);
    showSuccess(guestData);
    if (typeof sendRsvpEmails === 'function') sendRsvpEmails(guestData);
  });

  function showSuccess(g) {
    document.getElementById('form-section').classList.add('hidden');
    const sec = document.getElementById('success-section');
    sec.classList.remove('hidden');

    if (g.attending) {
      document.getElementById('success-heading').textContent = "You're on the list!";
      document.getElementById('success-message').textContent =
        `We're thrilled you can join us, ${g.name.split(' ')[0]}!`;
      document.getElementById('conf-status').textContent = 'Attending ✓';
      document.getElementById('conf-status').className = 'status-attending';
      const totalGuests = g.plusGuests > 0 ? `You + ${g.plusGuests}` : 'Just you';
      document.getElementById('conf-guests').textContent = totalGuests;
    } else {
      document.getElementById('success-heading').textContent = "We'll miss you!";
      document.getElementById('success-message').textContent =
        `Thanks for letting us know, ${g.name.split(' ')[0]}.`;
      document.getElementById('conf-status').textContent = 'Declined';
      document.getElementById('conf-status').className = 'status-declined';
      document.getElementById('conf-guests').textContent = '—';
    }

    document.getElementById('conf-name').textContent = g.name;
    document.getElementById('conf-email').textContent = g.email;
  }
}
