/* ── hero.js — Graduate photo hero banner ── */

const PHOTO_KEY = 'rsvp_hero_photo';
const banner    = document.getElementById('hero-banner');
const input     = document.getElementById('hero-photo-input');
const label     = document.getElementById('hero-upload-label');
const removeBtn = document.getElementById('hero-remove-btn');

function applyPhoto(dataUrl) {
  banner.style.backgroundImage = `url(${dataUrl})`;
  banner.classList.add('has-photo');
  label.classList.add('hidden');
  removeBtn.classList.remove('hidden');
}

function clearPhoto() {
  banner.style.backgroundImage = '';
  banner.classList.remove('has-photo');
  label.classList.remove('hidden');
  removeBtn.classList.add('hidden');
  localStorage.removeItem(PHOTO_KEY);
}

/* Load saved photo on page open */
const saved = localStorage.getItem(PHOTO_KEY);
if (saved) applyPhoto(saved);

/* Handle file selection */
input.addEventListener('change', () => {
  const file = input.files[0];
  if (!file) return;

  /* Warn if file is very large */
  if (file.size > 5 * 1024 * 1024) {
    alert('That image is over 5 MB — try a smaller or compressed version for best results.');
  }

  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    /* Resize/compress via canvas to keep localStorage happy (<= ~4 MB limit) */
    compressImage(dataUrl, 1400, 0.82, compressed => {
      try {
        localStorage.setItem(PHOTO_KEY, compressed);
      } catch {
        /* localStorage quota exceeded — use without saving */
        console.warn('Could not persist photo (storage full). It will show this session only.');
      }
      applyPhoto(compressed);
    });
  };
  reader.readAsDataURL(file);
  input.value = ''; /* allow re-selecting same file */
});

/* Remove button */
removeBtn.addEventListener('click', clearPhoto);

/* Canvas compression helper */
function compressImage(dataUrl, maxWidth, quality, callback) {
  const img = new Image();
  img.onload = () => {
    const scale  = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
}
