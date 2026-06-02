/* ── email.js — EmailJS integration ──────────────────────────────────────
 *
 *  SETUP (takes ~5 minutes, free):
 *
 *  1. Create a free account at https://www.emailjs.com
 *
 *  2. Add an Email Service:
 *     Dashboard → Email Services → Add New Service
 *     Choose iCloud / Apple Mail → connect your iCloud account
 *     Copy the Service ID and paste it below as EMAILJS_SERVICE_ID
 *
 *  3. Create TWO Email Templates (Dashboard → Email Templates → Create New):
 *
 *     Template A — Guest confirmation (EMAILJS_GUEST_TEMPLATE_ID)
 *     Subject:  Your RSVP is confirmed – {{event_title}}
 *     Body (paste this):
 *     -------------------------------------------------------
 *     Hi {{guest_name}},
 *
 *     Your RSVP for {{event_title}} has been confirmed!
 *
 *     📅 {{event_date}}
 *     📍 {{event_location}}
 *     👥 Guests: {{guest_count}}
 *
 *     If your plans change, you can cancel here:
 *     {{cancel_url}}
 *
 *     See you there!
 *     -------------------------------------------------------
 *     To:  {{guest_email}}
 *
 *     Template B — Host notification (EMAILJS_HOST_TEMPLATE_ID)
 *     Subject:  New RSVP: {{guest_name}} – {{event_title}}
 *     Body (paste this):
 *     -------------------------------------------------------
 *     New RSVP received!
 *
 *     Name:    {{guest_name}}
 *     Email:   {{guest_email}}
 *     Status:  {{status}}
 *     Guests:  {{guest_count}}
 *     Dietary: {{dietary}}
 *     Message: {{guest_message}}
 *     -------------------------------------------------------
 *     To: {{host_email}}
 *
 *  4. Get your Public Key:
 *     Dashboard → Account → General → Public Key
 *     Paste it below as EMAILJS_PUBLIC_KEY
 *
 * ─────────────────────────────────────────────────────────────────────── */

const EMAILJS_PUBLIC_KEY       = '68kJyRg-vxRpceJQc';       // ← from EmailJS account
const EMAILJS_SERVICE_ID       = 'service_rv6zncg';       // ← from Email Services
const EMAILJS_GUEST_TEMPLATE_ID = 'template_8pf3q2h';  // ← Template A ID
const EMAILJS_HOST_TEMPLATE_ID  = 'template_wgisd5u';   // ← Template B ID

const HOST_EMAIL  = 'ab8a@live.com';
const CANCEL_URL  = 'https://abraham8a.github.io/LosCuatesRSVP/cancel.html';

/* Initialize EmailJS */
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
})();

/**
 * Send confirmation email to guest + notification to host.
 * Called after a successful RSVP submission.
 * @param {object} guest - the guest data object
 * @returns {Promise}
 */
async function sendRsvpEmails(guest) {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS not loaded');
    return;
  }

  const guestCount = guest.attending
    ? (guest.plusGuests > 0 ? `You + ${guest.plusGuests}` : 'Just you')
    : 'N/A';

  const statusLabel = guest.attending ? 'Attending ✓' : 'Declined';

  const cancelLink = `${CANCEL_URL}#${encodeURIComponent(guest.email)}`;

  const commonParams = {
    event_title:    CONFIG.eventTitle,
    event_date:     CONFIG.eventDate,
    event_location: CONFIG.eventLocation,
  };

  /* 1. Guest confirmation email */
  const guestParams = {
    ...commonParams,
    guest_name:    guest.name,
    guest_email:   guest.email,
    guest_count:   guestCount,
    status:        statusLabel,
    dietary:       guest.dietary || 'None',
    cancel_url:    cancelLink,
  };

  /* 2. Host notification email */
  const hostParams = {
    ...commonParams,
    guest_name:    guest.name,
    guest_email:   guest.email,
    guest_count:   guestCount,
    status:        statusLabel,
    dietary:       guest.dietary || 'None',
    guest_message: guest.message || 'None',
    host_email:    HOST_EMAIL,
  };

  const statusEl = document.getElementById('email-status');

  try {
    /* Send both in parallel */
    await Promise.all([
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_GUEST_TEMPLATE_ID, guestParams),
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_HOST_TEMPLATE_ID,  hostParams),
    ]);
    if (statusEl) statusEl.textContent = '✓ Confirmation email sent to ' + guest.email;
  } catch (err) {
    console.error('EmailJS error:', err);
    if (statusEl) statusEl.textContent = 'Note: confirmation email could not be sent.';
  }
}
