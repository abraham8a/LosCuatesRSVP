# 🎉 RSVP App — GitHub Pages

A simple, elegant RSVP web app that runs entirely in the browser with no backend required. Guests can submit their RSVP, return later to cancel, and the host gets a live dashboard.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Guest RSVP form |
| `cancel.html` | Guest cancel / manage page |
| `admin.html` | Host dashboard with stats & guest list |
| `style.css` | Shared styles |
| `app.js` | Shared storage & form logic |
| `cancel.js` | Cancel page logic |
| `admin.js` | Admin dashboard logic |

---

## 🚀 Deploying to GitHub Pages

### 1. Create a new GitHub repository
- Go to [github.com](https://github.com) → **New repository**
- Name it something like `my-event-rsvp`
- Set it to **Public** (required for free GitHub Pages)
- Click **Create repository**

### 2. Upload your files
**Option A — GitHub web UI (easiest):**
1. Open your new repo on GitHub
2. Click **Add file → Upload files**
3. Drag all 7 files into the upload area
4. Click **Commit changes**

**Option B — Git CLI:**
```bash
git init
git add .
git commit -m "Initial RSVP app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. In your repo, go to **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose `main` branch, `/ (root)` folder
4. Click **Save**
5. After ~60 seconds, your site will be live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## ✏️ Customizing Your Event

Open `app.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  eventTitle:    'Summer Garden Party',   // ← Your event name
  eventDate:     'Saturday, July 19 · 4:00 PM', // ← Date & time
  eventLocation: '123 Rose Garden Lane',  // ← Venue / address
};
```

Also update the `<title>` tag in each HTML file to match your event.

---

## 📋 How It Works

- **Guest data** is stored in `localStorage` (browser storage) — no server needed
- Each guest's RSVP is keyed by **email address**
- Guests can return to `cancel.html` and enter their email to look up and cancel their RSVP
- The host accesses `admin.html` to view all RSVPs, filter by status, and export to CSV

### Important notes
- Data is stored **per browser/device** — guests must use the same browser to cancel
- The admin dashboard reads from the **same device's** localStorage (best for events where you manage RSVPs from one computer, or use the export feature to consolidate)
- For multi-device use, consider upgrading to a backend like [Supabase](https://supabase.com) or [Firebase](https://firebase.google.com) — the code structure makes this easy to adapt

---

## 🔗 Sharing Cancel Links

You can deep-link guests directly to their RSVP:
```
https://yoursite.github.io/rsvp/cancel.html#their@email.com
```

This auto-fills and loads their reservation on page load.

---

## 📤 Exporting Guest List

In the admin dashboard (`admin.html`), click **Export CSV** to download all guest data as a spreadsheet-compatible CSV file.
