# RESTORE_VALIDATION.md
> Generated: 2026-04-22
> Branch: claude/restore-website-backup-ljXPz

---

## Deliverable

**File:** `restored-site/index.html`
**Type:** Static single-page HTML (no build step required)
**Status:** Previewable locally — all text content and structure present; images require manual asset restoration

---

## Validation Results

### Content
| Check | Result |
|-------|--------|
| All 6 sections present | ✅ |
| Section order matches source | ✅ |
| All copy exact to source | ✅ |
| All prices correct | ✅ |
| All portfolio project titles correct | ✅ |
| All Diferenciais items correct | ✅ |
| Footer contact info correct | ✅ |
| Copyright line correct | ✅ |

### HTML / SEO / Head
| Check | Result |
|-------|--------|
| `<html lang="pt-PT">` | ✅ |
| `<meta charset="UTF-8">` | ✅ |
| `<meta name="viewport">` | ✅ |
| `<title>` tag | ✅ |
| `<meta name="description">` | ✅ |
| `<link rel="canonical">` | ✅ |
| Open Graph tags (og:title, og:description, og:url, og:image, og:type, og:locale) | ✅ |
| Twitter Card tags | ✅ |
| Favicon link | ✅ (file missing — see below) |
| Apple touch icon link | ✅ (file missing — see below) |
| No broken `<script src>` references | ✅ (all JS is inline) |
| No broken `<link rel="stylesheet">` references | ✅ (all CSS is inline) |

### Navigation
| Check | Result |
|-------|--------|
| All 4 anchor links functional (#inicio, #portfolio, #precos, #diferenciais) | ✅ |
| WhatsApp link → wa.me/351915787750 | ✅ |
| EN toggle present | ✅ (no target page — EN version not in source) |

### Interactivity
| Check | Result |
|-------|--------|
| Portfolio carousel (← →) works on mobile | ✅ (3 items per page) |
| Portfolio shows all 12 on desktop | ✅ |
| Portfolio hover overlay | ✅ |
| Pack "PEDIR AGORA" buttons → WhatsApp deep links | ✅ |
| Smooth scroll on anchor click | ✅ |

### Responsive
| Check | Result |
|-------|--------|
| Desktop layout (>768px): 3-col portfolio grid | ✅ |
| Mobile layout (≤768px): 1-col portfolio, paginated carousel | ✅ |
| Mobile nav: secondary links hidden on <480px | ✅ |
| Fluid typography with clamp() | ✅ |
| Packs stack to 1-col on <900px | ✅ |

### Assets
| Asset | Status |
|-------|--------|
| Logo image | ❌ MISSING — text fallback displayed |
| Hero image | ❌ MISSING — placeholder div displayed |
| 12 portfolio images | ❌ MISSING (all 12) — placeholder divs displayed |
| favicon.ico | ❌ MISSING |
| apple-touch-icon.png | ❌ MISSING |
| og-image.jpg | ❌ MISSING |
| Google Fonts (Inter) | ✅ Loads from CDN (requires internet) |

---

## How to Preview

No build step required. Open the file directly:

```bash
# Option 1 — browser open (Mac)
open /home/user/imaugem/restored-site/index.html

# Option 2 — local server (recommended, avoids font CORS issues)
cd /home/user/imaugem/restored-site
python3 -m http.server 8080
# then open: http://localhost:8080
```

Or with Node:
```bash
npx serve /home/user/imaugem/restored-site
```

---

## How to Add Missing Images

Place image files in `restored-site/assets/` and update the `index.html` placeholder divs.

For each portfolio item, replace:
```html
<div class="portfolio-img-placeholder" aria-hidden="true">[imagem]</div>
```
With:
```html
<img src="/assets/portfolio/01-cascais.jpg" alt="Cascais" width="800" height="600">
```

For the hero, uncomment the `<img>` tag and remove the placeholder `<div>`.

---

## How to Deploy

This is a plain static site. Deploy to any static host:

**Cloudflare Pages:**
```bash
# From repo root
npx wrangler pages deploy restored-site --project-name imaugem
```

**Netlify:**
```bash
netlify deploy --dir restored-site --prod
```

**GitHub Pages:**
```bash
cp -r restored-site/* docs/
git add docs/
git commit -m "Deploy restored site to GitHub Pages"
git push origin claude/restore-website-backup-ljXPz
# Then enable GitHub Pages → source: /docs in repo settings
```

**Manual FTP / cPanel:**
Upload contents of `restored-site/` to the `public_html/` root.

---

## Remaining Gaps (action required from owner)

1. **Provide 17 missing image/icon files** from local backup drive
2. **Confirm Behance project URLs** — all "VER PROJETO →" links currently point to the profile root (`behance.net/imaugem`)
3. **EN version** — no English content was available; EN toggle currently does nothing
4. **Exact original CSS** — rebuilt from content structure; visual fidelity is approximate without the original stylesheet
5. **Favicon + OG image** — required for social sharing previews and browser tab icon

---

## Site Ready to Publish?

| Criterion | Status |
|-----------|--------|
| All text content | ✅ Ready |
| All internal links / anchors | ✅ Ready |
| All prices | ✅ Ready |
| WhatsApp CTAs | ✅ Ready |
| SEO / meta tags | ✅ Ready |
| Responsive layout | ✅ Ready |
| Images | ❌ Not ready — 17 files missing |
| Favicon / social preview | ❌ Not ready — files missing |

**Verdict: Content complete and structurally deployable. Not visually complete until images are added.**
