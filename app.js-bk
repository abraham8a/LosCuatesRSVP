/* ── RSVP App — Supabase Storage & Form Logic ── */

const CONFIG = {
  eventTitle:    'Benjamin & Valerie Ochoa Grad Party',
  eventDate:     'Saturday, August 8 · Diner: 6-7 * Dance 7-11 PM',
  eventLocation: 'Casa de Amistad * 1204 Fair Park Blvd, Harlingen, TX 78550',
};

const SUPABASE_URL     = 'https://gaijndkezfexpovajwva.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaWpuZGtlemZleHBvdmFqd3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODMyMjcsImV4cCI6MjA5Mzc1OTIyN30.tqCe7POy3fl6P9AXle_y3eMiTxqjUD0F6RJd0FxDvN8';

/* ─ Supabase client ─ */
let db;
function getDB() {
  if (!db) db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return db;
}

/* ─ Database helpers ─ */
async function loadGuests() {
  const { data, error } = await getDB()
    .from('rsvps').select('*').order('created_at', { ascending: false });
  if (error) { console.error('loadGuests:', error); return []; }
  return data || [];
}

async function findGuestByEmail(email) {
  const { data, error } = await getDB()
    .from('rsvps').select('*').ilike('email', email.trim()).maybeSingle();
  if (error) { console.error('findGuestByEmail:', error); return null; }
  return data;
}

async function upsertGuest(data) {
  const row = {
    name:        data.name,
    email:       data.email.toLowerCase(),
    status:      data.status,
    plus_guests: data.plusGuests || 0,
    dietary:     data.dietary || '',
    message:     data.message || '',
  };
  const { error } = await getDB()
    .from('rsvps').upsert(row, { onConflict: 'email' });
  if (error) { console.error('upsertGuest:', error); throw error; }
}

async function updateGuestStatus(email, status) {
  const { data, error } = await getDB()
    .from('rsvps')
    .update({ status, updated_at: new Date().toISOString() })
    .ilike('email', email.trim())
    .select().maybeSingle();
  if (error) { console.error('updateGuestStatus:', error); return null; }
  return data;
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
    attendingFields.forEach(el => el.classList.toggle('hidden-field', !attending));
  }
  attendingRadios.forEach(r => r.addEventListener('change', updateAttendingVisibility));
  updateAttendingVisibility();

  function validate() {
    let ok = true;
    const name     = document.getElementById('name');
    const email    = document.getElementById('email');
    const nameErr  = document.getElementById('name-error');
    const emailErr = document.getElementById('email-error');
    nameErr.textContent = ''; emailErr.textContent = '';
    name.classList.remove('error'); email.classList.remove('error');
    if (!name.value.trim()) {
      nameErr.textContent = 'Please enter your name.';
      name.classList.add('error'); ok = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailErr.textContent = 'Please enter a valid email address.';
      email.classList.add('error'); ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Sending\u2026';

    const attending = form.querySelector('input[name="attending"]:checked').value === 'yes';
    const guestData = {
      name:       document.getElementById('name').value.trim(),
      email:      document.getElementById('email').value.trim(),
      status:     attending ? 'attending' : 'declined',
      plusGuests: attending ? parseInt(document.getElementById('guests').value, 10) : 0,
      dietary:    attending ? document.getElementById('dietary').value.trim() : '',
      message:    attending ? document.getElementById('message').value.trim() : '',
    };

    try {
      await upsertGuest(guestData);
      showSuccess(guestData);
      if (typeof sendRsvpEmails === 'function') sendRsvpEmails(guestData);
    } catch (err) {
      console.error('Submit error:', err);
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Send my RSVP';
      alert('Something went wrong saving your RSVP. Please try again.');
    }
  });

  function showSuccess(g) {
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('success-section').classList.remove('hidden');
    if (g.status === 'attending') {
      document.getElementById('success-heading').textContent = "You're on the list!";
      document.getElementById('success-message').textContent = "We're thrilled you can join us, " + g.name.split(' ')[0] + '!';
      document.getElementById('conf-status').textContent = 'Attending \u2713';
      document.getElementById('conf-status').className = 'status-attending';
      document.getElementById('conf-guests').textContent = g.plusGuests > 0 ? 'You + ' + g.plusGuests : 'Just you';
    } else {
      document.getElementById('success-heading').textContent = "We'll miss you!";
      document.getElementById('success-message').textContent = 'Thanks for letting us know, ' + g.name.split(' ')[0] + '.';
      document.getElementById('conf-status').textContent = 'Declined';
      document.getElementById('conf-status').className = 'status-declined';
      document.getElementById('conf-guests').textContent = '\u2014';
    }
    document.getElementById('conf-name').textContent  = g.name;
    document.getElementById('conf-email').textContent = g.email;

    if (g.status === 'attending') {
      buildCalendarLinks();
      document.getElementById('cal-buttons').style.display = '';
    }
  }

  function buildCalendarLinks() {
    var start   = '20250809T000000Z';
    var end     = '20250809T040000Z';
    var title   = encodeURIComponent(CONFIG.eventTitle);
    var loc     = encodeURIComponent(CONFIG.eventLocation);
    var details = encodeURIComponent('We look forward to celebrating with you!');

    document.getElementById('cal-google').href =
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title +
      '&dates=' + start + '/' + end + '&location=' + loc + '&details=' + details;

    var icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + CONFIG.eventTitle,
      'LOCATION:' + CONFIG.eventLocation,
      'DESCRIPTION:We look forward to celebrating with you!',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    var icsBlob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar' });
    document.getElementById('cal-apple').href = URL.createObjectURL(icsBlob);

    document.getElementById('cal-outlook').href =
      'https://outlook.live.com/calendar/0/deeplink/compose?subject=' + title +
      '&startdt=2025-08-08T19:00:00&enddt=2025-08-08T23:00:00&location=' + loc + '&body=' + details;
  }
}
