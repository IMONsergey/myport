# Design QA — revision 3, 15 October 2026

**Final result: passed**

This pass covers the reconstructed interaction system and the rendered states listed below. It is not a claim of pixel identity for different project content, Cyrillic copy, every physical device, or untested GPU execution.

## Visual truth and implementation

- Source: https://uncoded.framer.website/ — live Chrome interaction, plus its published animation component parameters.
- Implementation: http://terminal.local:4173/ — rebuilt local static output.
- Desktop viewport: 1363 × 936 CSS px; screenshots 1363 × 936 px, density 1. Scrollbar reduces layout width to 1348 px.
- Mobile: iframe 390 × 844 CSS px; source and implementation captured in the same 1363 × 936 browser. Both cropped to `(0,44,390,844)`, removing the harness navigation. Scrollable content width 375 px.
- Desktop comparisons downsample both sides equally to at most 680 × 470 px. Mobile comparison stays at density 1.
- Different logos, portrait, case images, capabilities and copy are intentional: this is Sergey Otcheskov's portfolio, not the fictional Uncoded studio. Sixteen real projects and their credits remain intact.

## Evidence opened together and reviewed

| State | Combined source + rendered implementation |
| --- | --- |
| Desktop menu, fully open | `docs/qa/v3/menu-comparison.jpg` |
| Service active, initial mismatch | `docs/qa/v3/service-before-comparison.jpg` |
| Service active, corrected | `docs/qa/v3/service-after-comparison.jpg` |
| Mobile menu, corrected links and portrait | `docs/qa/v3/mobile-menu-comparison.jpg` |
| Second sticky vision text | `docs/qa/v3/vision-comparison.jpg` |
| Final CTA, previous section cleared | `docs/qa/v3/cta-comparison.jpg` |
| Rendered hero with live Canvas wave | `docs/qa/v3/home-desktop.jpg` |

Mobile menu is a focused 1:1 comparison: heading size, line rhythm, social links, portrait crop and navigation controls remain readable. Other comparisons show full composition. The vision screenshots are both the second text, after hash navigation; their vertical exit positions and line counts vary with actual text length. They establish the same scene/state, not exact word-for-word geometry.

The mobile hero reference is white in this browser because its GPU background is unavailable, leaving white lettering invisible. `mobile-comparison.jpg` records that limitation and is not used to claim a pixel match. The implementation's software renderer avoids this source failure.

## Iterations and resolved findings

1. **[P1] v2 missed the motion system.** Static resemblance was insufficient. Added Lenis 1.3.23, separate line entry/scroll transforms, actual reel dialog and 3D hover, scrubbed random letter reveals, expanding section backgrounds, independent moving plus marks, two-text sticky scene, parallax, shrinking practice title, sticky final video, menu entrance/3D exit, link/header hover states. Source parameters: `docs/motion-map.md`.
2. **[P1] Services showed a generic left paragraph and oversized titles.** First comparison exposed missing index/capability states and a hard background boundary. Rebuilt the 50/32/18 grid, restored 56 px display titles, animated index and capability list, and extended the image background behind the introduction. Post-fix: `service-after-comparison.jpg`.
3. **[P1] Mobile menu omitted the portrait; headings were 56 rather than 44 px.** Restored the portrait below links/socials, 44 px type, 16 px gutters, 60 px internal gap and scrolling as needed. Post-fix: `mobile-menu-comparison.jpg`.
4. **[P1] Sticky text could remain partly blurred.** Its scroll progress was incorrectly measured from the pinned position. The first reveal now uses normal-flow geometry; the second uses the separate 436 px trigger. Browser observed first progress1, then opacity0 and second progress1. Post-fix: `vision-comparison.jpg` and DOM measurements.
5. **[P1] Adding a menu canvas redirected the generic hero canvas selector.** Isolated hero and menu initialization. Actual hero renderer frames advanced 506 → 758 → 1993. The menu now uses its own two-color palette. Post-fix: `home-desktop.jpg` and final mobile menu comparison, without the earlier blue seam.
6. **[P2] CTA colors, button scale and background behavior differed.** Restored light reference video, hue tint, black text, 32 px CTA link and sticky reveal from below the previous white scene. Post-fix: `cta-comparison.jpg`.
7. **[P2] Moving plus marks had not reached their end positions.** Switched progress to the reference's viewport-entry range. At CTA top≈0, the left group is translateX(−160 px), bounding right edge −40 px; reference translateX(−160 px). Post-fix CTA comparison shows both groups outside the screen.

## Required fidelity surfaces

- **Fonts / typography:** local Instrument Serif and Geist are preserved. Oranienbaum/Golos provide Cyrillic coverage. Hero and inner-title lines animate separately. Services 56 px, mobile menu 44 px, CTA title100/link32 match source scales. Different language lengths cause expected wrapping changes.
- **Spacing / layout:** verified 40 px desktop and 16 px mobile gutters, desktop menu composition, mobile portrait flow, service columns, sticky 100vh text scene and final full-screen CTA. No horizontal overflow in mobile home, catalogue, case or contact page.
- **Colors / tokens:** black/white architecture, blue wave palette and light CTA are source-derived. Software wave/menu render where source WebGL is absent. Different animation times mean different wave/video frames.
- **Images / assets:** original local decorative videos remain; project and portrait images belong to the user's existing content. Parallax applies only to cropped media; natural case galleries remain readable. No generated project images or invented testimonials.
- **Copy / content:** all 16 projects, credits, real contact details and portfolio links remain. Service details describe the actual service categories; original studio testimonials/metrics were not attributed to Sergey.

## Interaction and runtime checks

- Desktop: reel opens with controls and playback, closes through Escape, returns focus and unlocks the page. Menu open/close tested. Service hover/click changes active state. Vision text phases, image parallax and practice scale(.4) inspected.
- Mobile: menu → Works, Branding filter → four actual projects, Serenity Aviation case opens and cover loads, contact fields render with required name/email/message, no horizontal overflow.
- Parallax translateY changed from −3.996 to 17.902 px while scale remained1.25.
- Pause: motion-paused=true, video paused=true, button changes to “Включить анимацию”; resume starts movement again. OS-level reduced-motion and physical touch hardware were not emulated.
- Syntax checks passed. Build/check passed: 21 pages, 16 projects, 734 local references, 183 images.
- Console reviewed: no app errors. Metadata errors originate from the browser extension.
- WebGL2 is unavailable in this environment; Canvas 2D fallback verified. GPU branch and exact spring response on a physical device remain test gaps, not represented as tested.

## Implementation checklist

- [x] Replace missing/invented v2 motion with source-derived scenes.
- [x] Correct identified desktop and mobile visual differences.
- [x] Preserve project content, navigation, contact functions and keyboard dialog behavior.
- [x] Rebuild and validate all generated pages.
- [x] Capture and inspect combined comparison evidence after fixes.

**Follow-up polish:** [P3] Native CSS spring approximation and software-wave sampling can differ subtly from Framer/GPU rendering. These do not block the tested interactions. No remaining actionable P0/P1/P2 finding in the reviewed states.

final result: passed
