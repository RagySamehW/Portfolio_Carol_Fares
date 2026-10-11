# Carol Fares — portfolio starter

A bold, editorial graphic-design portfolio. Static site built with Vite + TypeScript + Tailwind CSS v4, no framework.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/
npm run preview   # preview the production build
```

## Swap in your own content

- **Name and copy**: `index.html` and the four pages in `work/`. Search for "Carol Fares" to update the name everywhere.
- **Images**: every image is a `picsum.photos` placeholder with a descriptive seed. Replace each `src` with your own photography/artwork, keeping the `width`/`height` attributes close to the original aspect ratio.
- **Projects**: each case study is its own page in `work/`. Duplicate one of the four files to add a project, and add a matching tile in the "Selected work" grid in `index.html`.
- **Testimonial**: the quote in `index.html` is a placeholder (flagged with a `TODO` comment) — replace it with a real client quote before publishing.
- **Social links / email**: update the `mailto:` link and the three social links in the contact section of `index.html`.
- **Colors**: the palette (background, text, accent) lives in the `@theme` block at the top of `src/style.css`.
- **Work filter categories**: each tile in the grid has `data-category` (`branding` / `editorial` / `packaging` / `art-direction`); keep it in sync with the filter pills above the grid.
- **"What I do" panels**: the horizontal-scroll section in `index.html` (`data-capabilities-pan`) pins and pans on desktop; add or remove `.capability-panel` articles to change the count, no JS changes needed.
- **About page** (`about.html`): bio, career timeline, and a "Selected clients" list reusing the four demo projects. Update the timeline entries and portrait image once you have real history to put there.
- **Command palette** (Cmd/Ctrl+K): the destination list is the `PALETTE_ITEMS` array near the top of `initCommandPalette` in `src/main.ts`. Add a project there when you add one to the site.
- **Before/after sliders** (`[data-compare]`, used on Kinema and Signal): two stacked images (`.compare__before` / `.compare__after`) plus a draggable `.compare__handle`. Use this only where there's a real "old version" to show.
- **Process timelines** (`.timeline` / `.timeline-step`, used on Undertow, Maren, and the About page's career section): a simple vertical list of numbered steps, each with an optional image. Add or remove `.timeline-step` blocks freely.
- **"Download PDF"** (`[data-print]`): triggers the browser's native print dialog against a dedicated print stylesheet (`@media print` in `src/style.css`) that hides chrome (nav, grain, command palette, etc.) and lays the case study out as a clean single column. Anyone can "Save as PDF" from that dialog — there's no separate binary to generate or keep in sync.
- **SEO**: every page has Open Graph/Twitter meta tags, a canonical URL, and JSON-LD (`Person` on the homepage, `CreativeWork` per case study). `public/sitemap.xml` and `public/robots.txt` are hand-written since the site only has six pages. **Before deploying**, replace every `https://carolfares.studio` reference (meta tags, JSON-LD, sitemap, robots.txt) with your real deployed domain.
- **OG images** (`public/og/*.png`): one 1200×630 branded card per page, pre-generated from a small template (not shipped — see git history if you need to regenerate after a copy change). Swap these for real designed cards whenever you like.
- **Analytics**: a commented-out Plausible script tag sits in the `<head>` of every page. Sign up at [plausible.io](https://plausible.io), add your domain, uncomment the tag, and replace `data-domain="carolfares.studio"` with it. For Fathom or another privacy-friendly tool, swap the `<script>` tag for theirs in the same spot.

## Features

Motion is deliberately varied by content type rather than one effect reused everywhere — each `data-*` attribute below is a distinct technique, picked per section:

- **Smooth scroll**: Lenis drives all scrolling site-wide, synced to GSAP's ticker so ScrollTrigger stays in step (`initSmoothScroll` in `src/main.ts`). Disabled under `prefers-reduced-motion`.
- **Intro animation**: a one-time name reveal on first paint (`[data-preloader]`, homepage only), skipped under reduced motion or with JS disabled.
- **Kinetic hero text + scramble**: hero headline words rise from a clipping mask; "opinion" decodes in from random characters (`scrambleIn` in `src/main.ts`).
- **`[data-split-reveal]`**: the signature headline treatment reused across every section (About, Work, Contact, "What I do", and every case-study `<h1>`) — words rise out of a mask on scroll. Reuses `splitWords()`; only works on headlines with plain text (no nested markup), since it rewrites `innerHTML` from `textContent`.
- **`[data-reveal]` vs `[data-reveal-dir="left|right"]`**: body content wipes in vertically; images (work tiles, case-study galleries) wipe in horizontally, alternating direction per item for rhythm. Both are ScrollTrigger-driven, not IntersectionObserver — a clip-path-collapsed element reports zero intersection in Chromium, which would deadlock an IO-based trigger.
- **`.ken-burns`**: a slow settle-zoom on hero/case-study cover images, tied to the same `[data-revealed]` toggle as the clip-path wipe. Needs an `overflow-hidden` wrapper.
- **`[data-quote-sweep]`**: the testimonial quote lights up word-by-word as it scrolls through the viewport (scrubbed, not a one-shot reveal) — distinct from the headline/image treatments.
- **Hero canvas**: a lightweight 2D halftone dot field behind the hero (`initHeroCanvas`), brightening near the pointer — a print-motif stand-in for a full WebGL background, at a fraction of the cost.
- **Horizontal-pan "What I do"**: pins and pans sideways on scroll (desktop only; stacks normally on mobile and under reduced motion) via GSAP ScrollTrigger + `ScrollTrigger.matchMedia`.
- **Magnetic buttons, cursor tilt, grain overlay, scroll-progress bar**: smaller hover/scroll-feedback touches, all gated behind `prefers-reduced-motion`.
- **Cross-page view transitions**: `@view-transition { navigation: auto }` in `src/style.css` gives native crossfades between pages in supporting browsers (progressive enhancement, no fallback needed). Work-tile images share a `view-transition-name` (`.vt-kinema`, etc.) with their case-study hero image for a morph effect between the grid and the project page.

## Deploy

The build output in `dist/` is a plain static site, deployable anywhere. It's host-agnostic by design: `vite.config.ts` sets `base: "./"` and every internal link (nav, work tiles, command palette, "Next project") is relative rather than root-absolute, so the same build works unmodified at a domain root, a custom domain, or a GitHub Pages project subpath (`username.github.io/repo-name/`) — no path reconfiguration needed either way.

**GitHub Pages**: `.github/workflows/deploy.yml` builds and deploys automatically on every push to `main`, via GitHub's official Pages Actions (`configure-pages` / `upload-pages-artifact` / `deploy-pages`). In the repo's Settings → Pages, set the source to "GitHub Actions" once, and pushes to `main` publish from there on.

**Netlify / Vercel**: drag-and-drop `dist/` onto Netlify, or run `vercel --prod` / connect the repo — `npm run build` as the build command, `dist` as the output directory.

**Before deploying to a custom domain**, also replace every `https://carolfares.studio` reference per the SEO note above.
