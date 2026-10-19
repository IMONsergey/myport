# Portfolio V4 — quality verification

**Project:** `IMONsergey/myport`
**Working branch:** `feat/portfolio-editorial-v4-2026-10-19`
**Date:** 19 October 2026

## Scope

The V4 release replaces the reference-derived marketing pages with an original editorial presentation for Sergey Otcheskov. The static build contains 21 HTML pages (home, Works, About, Contact, 16 case studies and a standalone 404), 16 structured project records and accompanying editorial context.

- The home uses real project imagery rather than decorative footage imported from Uncoded.
- Case studies expose context, approach, visuals, project ownership, sources and related work.
- APCOSYS and DEBT TECH include new screenshots from the public, owner-controlled sites, including mobile captures and interface sections.
- Six Senses is marked as an archive entry: original project galleries have not been fabricated.
- Distinctive Open Graph images are generated from actual case assets. No unverified performance indicators or authorship have been added.
- The contact form is intentionally transparent: it prepares a message in a mail client rather than claiming a server submission.

## Automated checks

Run from the repository root:

```sh
npm ci
BASE_PATH=/myport/ SITE_URL=https://imonsergey.github.io/myport npm run build
BASE_PATH=/myport/ npm run check
node --check scripts/build.mjs
node --check src/motion.js
node --check src/editorial.js
git diff --check
```

The expanded check validates 21 HTML pages, 16 projects, their stories and media, link targets, responsive image sources, Open Graph previews, JSON-LD and the generated editorial template.

## Browser QA

Local automated Chromium/Puppeteer checks:

- Desktop 1440 × 900 and simulated mobile 390 × 844: all published routes opened; no application JS errors or unavailable local assets during the crawl.
- Additional responsive widths: 320, 360, 390, 768, 810, 1024, 1280 and 1440 px, across home, Works, About, Contact, representative digital/event/branding cases and 404.
- Tested main menu open, Escape to close and scroll restoration; portfolio reel open/close; motion pause; enlarged image lightbox and Escape; case scroll progress; Works filtering including URL state; required contact fields and truthful email-client semantics.
- Browser screenshots are stored in the temporary QA workspace rather than committed as decorative production files.

## Lighthouse snapshot

Measured against the local HTTP preview under simulated mobile conditions. These are lab measurements, not field data.

| Route | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Home, bundled CSS pass | 94 | 100 | 100 | 100 |
| APCOSYS, pre-bundling pass | 95 | 100 | 100 | 100 |

The first home test before bundling scored 86 in Performance; after consolidating styles and loading key hero images eagerly it scored 94. Actual scores depend on device, network and timing.

## Known limitations and follow-up

- Captured public project screens are historical snapshots; keep them fresh as APCOSYS and DEBT TECH evolve.
- Six Senses still needs its original image gallery before this is a complete case study.
- The contact form intentionally has no server backend; production email delivery requires a consented integration and spam protection.
- Real iOS/Android physical-device visual QA, assistive technology testing, and GPU-intensive performance profiling remain recommended before treating every device as verified.
- Older QA files (`design-qa.md`, `docs/verification.md`) describe the historical reference-oriented V3 and should not be used to infer V4's visual specification.
