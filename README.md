# TheUnlockedWeb

Personal website for [EthanUnlocked's gaming hits](https://www.youtube.com/@ethan1957-p2y) — hosted on GitHub Pages.

---

## Structure

```
/
├── index.html              # Homepage
├── style.css               # Shared stylesheet
├── README.md
├── generate_videos.py      # Manual video JSON generator
│
├── .github/
│   └── workflows/
│       └── fetch-videos.yml
│
├── json/
│   ├── news.json           # News feed data
│   ├── games.json          # Games list
│   └── videos.json         # Auto-generated video list
│
├── games/
│   ├── index.html          # Games page
│   └── thumbnails/         # Game thumbnail images
│       └── agar.png
│
└── videos/
    └── index.html          # Videos page
```

All pages use **clean URLs** — no `.html` in links. GitHub Pages serves `videos/index.html` automatically when you visit `/videos/`.

---

## Pages

### `/` — Homepage
- Animated hero with time-aware greeting
- YouTube and Discord CTAs
- About section
- News feed (paginated, loaded from `json/news.json`)

### `/videos/` — Videos
- Auto-fetches latest uploads from YouTube via RSS
- Filter by All / Videos / Shorts
- Skeleton loading state

---

## Adding Games

Open `json/games.json` and add an entry:

```json
{
  "id": "mygame",
  "title": "My Game",
  "desc": "Short description of the game.",
  "url": "https://my-game-url.com",
  "thumbnail": "./thumbnails/mygame.png",
  "icon": "fa-solid fa-gamepad",
  "iconBg": "rgba(129,140,248,.13)",
  "iconColor": "#818cf8",
  "tags": [
    { "label": "Puzzle", "color": "purple" }
  ]
}
```

**Thumbnail:** save a screenshot or image to `games/thumbnails/mygame.png`. If `thumbnail` is `null`, the page falls back to the icon instead.

**Tag colors:** `"gold"`, `"purple"`, or `"green"`.

**`url`** must allow iframe embedding. If the game blocks iframes, players can still use the "Open tab" button in the launcher.

## Adding News

Open `json/news.json` and prepend a new object to the top of the array:

```json
{
  "id": 13,
  "tag": "YouTube",
  "color": "gold",
  "title": "Your news title here",
  "body": "A short description of the news item.",
  "date": "2025-06-15",
  "icon": "fa-brands fa-youtube"
}
```

**Fields:**

| Field | Values |
|-------|--------|
| `tag` | Any short label, e.g. `YouTube`, `Games`, `Site` |
| `color` | `gold`, `purple`, or `green` |
| `date` | ISO format: `YYYY-MM-DD` |
| `icon` | Any [Font Awesome 6](https://fontawesome.com/icons) class string |

---

## Adding Videos

Open `generate_videos.py`, add your video IDs to the `VIDEOS` list, then run it:

```python
VIDEOS = [
    ('dQw4w9WgXcQ', 'My Video Title', '2025-06-10', False),  # False = regular, True = Short
]
```

```bash
python3 generate_videos.py
```

This writes `json/videos.json`. Commit and push — the videos page updates instantly.

The video ID is the part after `?v=` in any YouTube URL.

---

## Shared Styles

`style.css` contains everything shared across pages:

- CSS custom properties (design tokens)
- Reset
- Grain + aurora background layers
- Nav, footer, buttons, chips
- About cards
- News paginator
- Keyframe animations

Page-specific styles (hero layout, video grid, etc.) live in a `<style>` block inside each page's `<head>`.

---

## Adding a New Page

1. Create a new directory, e.g. `about/`
2. Add `about/index.html`
3. Link the shared stylesheet with `../style.css`
4. Copy the nav and footer from an existing page, updating the `.active` link
5. Push — GitHub Pages will serve it at `/about/`

**Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — TheUnlockedWeb</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../style.css">
  <style>
    /* page-specific styles here */
  </style>
</head>
<body>

<div class="grain" aria-hidden="true"></div>
<div class="aurora" aria-hidden="true">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
</div>

<nav class="nav">
  <a href="../" class="nav-brand">TUW</a>
  <div class="nav-divider"></div>
  <div class="nav-links">
    <a href="../">Home</a>
    <a href="../videos/">Videos</a>
    <a href="./" class="active">This Page</a>
  </div>
  <div class="nav-socials">
    <a href="https://www.youtube.com/@ethan1957-p2y" class="nav-pill nav-pill-yt" target="_blank">
      <i class="fa-brands fa-youtube"></i> YouTube
    </a>
    <a href="https://discord.gg/vBMNDBTFn" class="nav-pill nav-pill-dc" target="_blank">
      <i class="fa-brands fa-discord"></i> Discord
    </a>
  </div>
</nav>

<div class="wrap">
  <!-- content -->
</div>

<footer>
  <span class="f-brand">TheUnlockedWeb</span>
  <span class="f-copy">© 2025 EthanUnlocked's gaming hits</span>
  <div class="f-links">
    <a href="https://github.com/EthanUnlocked690/EthanUnlocked690.github.io" target="_blank">
      <i class="fa-brands fa-github"></i> Source
    </a>
  </div>
</footer>

</body>
</html>
```

---

## Tech

- Pure HTML, CSS, JavaScript — no frameworks
- Hosted on [GitHub Pages](https://pages.github.com)
- Icons via [Font Awesome 6](https://fontawesome.com)
- Fonts via [Google Fonts](https://fonts.google.com) (Syne + Manrope)
- YouTube feed via [rss2json.com](https://rss2json.com)