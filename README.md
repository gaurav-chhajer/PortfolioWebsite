# Gaurav Chhajer: portfolio

A static site with no build step: plain HTML, CSS and JavaScript, with GSAP, ScrollTrigger and Lenis bundled locally. About 330 KB on first load, no third-party requests. Works on Vercel, GitHub Pages, Netlify or any static host.

## Before you deploy

1. **Domain.** The site is already set to https://gauravwebdev.vercel.app. To use a different address, run this with the new one:
   `sh scripts/set-site-url.sh https://your-domain.com`
   This fills in the canonical link, link-preview (Open Graph) tags, sitemap, robots.txt and search metadata.
2. **Contact form (optional).** In `js/config.js` set `formKey` to a free key from https://web3forms.com. With a key the form sends the message itself and the button reads "Send message". Without one, the form opens a pre-filled email draft and the button reads "Open email draft".
3. **Optional links.** In `js/config.js`, `live.translator` adds a "Live app" button to the Azure Media Translator card, and `paper` links the research paper. Leave `""` to hide them.

The two live apps (StudentConnect, Emotion Journal) are already set in `js/config.js`. Open both after deploying and check they respond.

## Everything you will edit

| What | Where |
| --- | --- |
| Live app links, form key, paper link, email and phone | `js/config.js` |
| All page text, projects, experience, skills | `index.html` (search for the project name) |
| Colors | `--accent`, `--accent-bright` and the other tokens at the top of `css/styles.css` |
| Resume | replace `assets/Gaurav_Chhajer_Resume.pdf` (same filename; it is cached for an hour only) |

## Two links, two audiences

The site has a Recruiter and a Client view. Visitors can switch at the top, or you can choose for them:

- `https://your-domain.com/?for=recruiter` (put this on your resume and applications)
- `https://your-domain.com/?for=client` (put this on freelance profiles)

The footer button "Copy link to this view" copies the right link for whichever view is open.

## Deploy

**Vercel:** push this folder to GitHub, import it in Vercel, leave every setting on default. `vercel.json` sets caching, security headers and a strict Content-Security-Policy. `.vercelignore` keeps this README and `scripts/` out of the public site.

**GitHub Pages:** push to a repo, Settings, Pages, deploy from `main` and `/ (root)`. `.nojekyll` is included. GitHub Pages ignores `vercel.json`, so the security headers and cache rules apply on Vercel only.

If you add a script, font or image host later, extend the Content-Security-Policy in `vercel.json` or the browser will block it.

## Checks already made

- Keyboard accessible, skip link, visible focus, `prefers-reduced-motion` respected, readable with JavaScript off.
- Text contrast meets WCAG AA in both views.
- No console errors under the shipped Content-Security-Policy; no horizontal scroll at 390 px or 1440 px; phone menu works.
- Tested in Chromium only. Check Safari, Firefox and a real phone after deploying.

## Credits and licences

GSAP and ScrollTrigger (GreenSock, free standard licence), Lenis (MIT), Bricolage Grotesque and JetBrains Mono (SIL Open Font License). The hero shader is hand-written GLSL.

## Icons

The "GC" icon matches the logo in the header. Files: `favicon.ico`, `assets/favicon.svg`, `assets/apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png` and `site.webmanifest`. Browsers cache favicons for a long time, so after deploying a changed icon you may need a hard refresh to see it.
