# Hafiz Afaq (AI Guy) — Portfolio

> I make tailored AI content for brands.

A single-page portfolio with no build step. It has:

- **Case studies** (ULTRA, GG Pod, Stately, Dynamic Learning Hub, Sans, BUNN). Each one has the final film, character sheets, the story, a beat-by-beat breakdown, the production workflow and the tools used.
- **Toolkit** with tool logos, plus Lab, Workflow, About, experience and education.
- **IP & Regulatory**: trademark, patent and brand protection, DRAP dossiers, licensing, import/export and OSINT work with ORAKSER.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

On GitHub, open **Settings → Pages**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.

## Structure

```
index.html        # the whole site: HTML, CSS and JS
media/            # sheets (webp), clips, final films, posters, logos
  f/              # final films
  ip/             # ORAKSER brand reels
  logo/           # tool logos
```

The Studio (the video upload drawer) only works inside the hosted claude.ai version. On GitHub Pages it is hidden, and the site works without it.

© Hafiz Afaq Nasir
