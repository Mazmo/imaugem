# RESTORE_AUDIT.md
> Generated: 2026-04-22
> Branch: claude/restore-website-backup-ljXPz

---

## Source of Truth

| Item | Detail |
|------|--------|
| Backup file requested | `imaugem_updated.html` (local path: `~/Mesa/Imagem/site/imaugem_updated.html`) |
| Backup file accessible in environment | **NO** — file is on a local Mac drive, not in this repo or cloud session |
| Source used for restoration | Rendered text content pasted directly by the user |
| Repo is the live site source | **NO** — `mazmo/imaugem` is an SEO audit/scraping repo; no site source code existed here |

---

## Site Identity

| Field | Value |
|-------|-------|
| Brand | IMAUGEM |
| Service | Fotografia Imobiliária (Real Estate Photography) |
| Contact email | imaugem@gmail.com |
| Phone | +351 915 787 750 |
| Instagram | @imaugem |
| Location | Parede, Portugal |
| Domain | imaugem.pt |
| Copyright | © 2026 IMAUGEM · Fotografia Imobiliária · Parede, Portugal |

---

## Page Structure Restored

All sections restored in original order:

| # | Section | Anchor | Status |
|---|---------|--------|--------|
| 1 | Navigation (logo + links) | — | ✅ Restored (text logo; image logo missing) |
| 2 | Hero (title + subtitle + desc + image + CTA + badges) | `#inicio` | ✅ Text restored; hero image missing |
| 3 | Portfólio (12 items + carousel nav) | `#portfolio` | ✅ All labels/titles restored; all 12 images missing |
| 4 | Preços (base table + extras + 3 packs) | `#precos` | ✅ Fully restored |
| 5 | Diferenciais (4 items + IVA note) | `#diferenciais` | ✅ Fully restored |
| 6 | Footer (contact + social links + copyright) | — | ✅ Fully restored |

---

## Content Restored (Exact Copy)

### Navigation
- Início · Portfólio · Preços · Diferenciais · WhatsApp · EN

### Hero
- **H1:** FOTOGRAFIA IMOBILIÁRIA
- **Subtitle:** A imagem que valoriza o imóvel e acelera a venda
- **Body:** Fotografia profissional com luz natural e composição cuidada para valorizar cada detalhe do seu anúncio.
- **Caption:** Cascais — Fotografia Imobiliária
- **CTA:** VER NO BEHANCE →
- **Badges:** LISBOA · CASCAIS · OEIRAS · SINTRA | 24H–48H · ENTREGA | VERTICAIS CORRIGIDAS

### Portfolio (12 items)
1. Cascais
2. Apartamento — Lapa, Lisboa
3. Av. Infante Santo — Lisboa
4. Apartamento — Parede, Cascais
5. Interiores — Lisboa e Cascais
6. Fachadas e Exteriores
7. Piscinas e Áreas Externas
8. Tortugas — Guarujá · SP
9. Casa Iporanga — Guarujá
10. Casa Sítio São Pedro I — Guarujá
11. Casa Sítio São Pedro II — Guarujá
12. Casa Sítio São Pedro III — Guarujá

Each item: label + "VER PROJETO →" (links to behance.net/imaugem — exact project URLs unknown)

### Prices — Fotografia Base
| Typology | Price |
|----------|-------|
| T1 | 40€ |
| T2 | 40€ |
| T3 | 45€ |
| T4 | 50€ |
| T5 / Moradia pequena | 60€ |
| Moradias grandes / Quintas | desde 70€ |

### Extras
| Service | Price |
|---------|-------|
| Vídeo Reels (até 60s) | 30€ |
| Drone | 40€ |
| Visita Virtual / 360° | 40€ |

### Packs
| Pack | Contents | Price |
|------|----------|-------|
| VENDA RÁPIDA | Fotos + Reels | 65€ |
| PACK CAPTAÇÃO | Fotos + Drone | 75€ |
| PACK COMPLETO | Fotos + Reels + Drone + Visita Virtual | 135€ |

- Note: "Preços pensados para agências e profissionais do setor · Condições especiais para volume mensal · Valores sujeitos à tipologia, área, localização e complexidade do imóvel."

### Diferenciais
- ✓ Entrega em 24h / 48h
- ✓ Olhar de Arquiteto
- ✓ Deslocação Lisboa / Cascais / Sintra
- ✓ Edição profissional incluída
- Note: "Aos valores indicados acresce IVA à taxa legal."

### Footer
- imaugem@gmail.com | +351 915 787 750 | @imaugem
- INSTAGRAM · BEHANCE · LINKTREE · WHATSAPP
- © 2026 IMAUGEM · Fotografia Imobiliária · Parede, Portugal

---

## Missing Assets

These files are referenced in `restored-site/index.html` but do not exist anywhere in this repo or environment. They must be sourced from your local backup drive and placed at the listed paths.

| File | Path in site | Notes |
|------|-------------|-------|
| Logo image | `/assets/logo.[png\|svg]` | Shown in nav; text fallback active |
| Hero image | `/assets/hero-cascais.jpg` | Large full-width image; placeholder active |
| Portfolio image 1 | `/assets/portfolio/01-cascais.jpg` | Cascais project |
| Portfolio image 2 | `/assets/portfolio/02-lapa-lisboa.jpg` | Apartamento — Lapa |
| Portfolio image 3 | `/assets/portfolio/03-infante-santo-lisboa.jpg` | Av. Infante Santo |
| Portfolio image 4 | `/assets/portfolio/04-parede-cascais.jpg` | Apartamento — Parede |
| Portfolio image 5 | `/assets/portfolio/05-interiores-lisboa-cascais.jpg` | Interiores |
| Portfolio image 6 | `/assets/portfolio/06-fachadas-exteriores.jpg` | Fachadas e Exteriores |
| Portfolio image 7 | `/assets/portfolio/07-piscinas-externas.jpg` | Piscinas e Áreas Externas |
| Portfolio image 8 | `/assets/portfolio/08-tortugas-guaruja.jpg` | Tortugas — Guarujá |
| Portfolio image 9 | `/assets/portfolio/09-casa-iporanga-guaruja.jpg` | Casa Iporanga |
| Portfolio image 10 | `/assets/portfolio/10-sitio-sao-pedro-1-guaruja.jpg` | Casa Sítio São Pedro I |
| Portfolio image 11 | `/assets/portfolio/11-sitio-sao-pedro-2-guaruja.jpg` | Casa Sítio São Pedro II |
| Portfolio image 12 | `/assets/portfolio/12-sitio-sao-pedro-3-guaruja.jpg` | Casa Sítio São Pedro III |
| Favicon | `/favicon.ico` | Referenced in `<head>` |
| Apple touch icon | `/apple-touch-icon.png` | Referenced in `<head>` |
| OG image | `/og-image.jpg` | Referenced in OG/Twitter meta tags (1200×630) |

**Total missing: 17 files**

---

## Unknown / Unrestorable

| Item | Reason |
|------|--------|
| Original CSS (exact values) | Not available — original `.html` or stylesheet not accessible |
| Original JS behavior | Not available — carousel logic reconstructed from visible behavior only |
| Exact Behance project URLs | Unknown — all portfolio "VER PROJETO →" links point to behance.net/imaugem profile as fallback |
| EN language version | No English content was present in the pasted source |
| Linktree URL | Reconstructed as `linktr.ee/imaugem` (standard handle format) |
| Instagram URL | Reconstructed as `instagram.com/imaugem` (standard handle format) |

---

## What Was NOT Changed

- No content invented or added
- No sections reordered
- No redesign applied
- No copy altered
- No sections removed
