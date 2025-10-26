# Tasklet — Simple Webapp

A tiny, dependency‑free webapp (HTML/CSS/JS) to manage tasks. Data is stored in the browser using `localStorage`. Perfect to drop into a Git repo and host on any static server (GitHub Pages, Netlify, S3, etc.).

## Features
- Add / edit / delete tasks
- Mark done / filter by status
- Search filter
- Export / import as JSON
- Dark‑mode friendly (respects system theme)

## Project structure
```
simple-webapp-git/
├─ index.html
└─ assets/
   ├─ style.css
   └─ app.js
```

## Run locally
No build needed. Just open `index.html` in your browser. For a local server:
```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages
1. Create a new Git repo and push this folder.
2. In GitHub, go to **Settings → Pages**.
3. Select **Deploy from a branch** (e.g., `main` root) and save.

## Git quickstart
```bash
git init
git add .
git commit -m "Init: Tasklet simple webapp"
git branch -M main
git remote add origin <YOUR_REMOTE_URL>
git push -u origin main
```

## License
MIT. Do whatever, just keep the license.
