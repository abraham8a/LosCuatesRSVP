/* ── photo.js — Graduate photo upload & persist ── */

const PHOTO_KEY = 'rsvp_grad_photo';

const photoInput   = document.getElementById('photo-input');
const gradPhoto    = document.getElementById('grad-photo');
const placeholder  = document.getElementById('photo-placeholder');
const uploadLabel  = document.getElementById('upload-label');
const removeBtn    = document.getElementById('remove-photo-btn');

function showPhoto(dataUrl) {
  gradPhoto.src = dataUrl;
  gradPhoto.classList.remove('hidden');
  placeholder.classList.add('hidden');
  uploadLabel.title = 'Change photo';
  removeBtn.classList.remove('hidden');
}

function clearPhoto() {
  gradPhoto.src = '';
  gradPhoto.classList.add('hidden');
  placeholder.classList.remove('hidden');
  uploadLabel.title = 'Upload photo';
  removeBtn.classList.add('hidden');
  localStorage.removeItem(PHOTO_KEY);
}

// Load saved photo
const saved = localStorage.getItem(PHOTO_KEY);
if (saved) showPhoto(saved);

// Handle file pick
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    localStorage.setItem(PHOTO_KEY, dataUrl);
    showPhoto(dataUrl);
  };
  reader.readAsDataURL(file);
});

removeBtn.addEventListener('click', clearPhoto);
