# Gaurav Chhajer — Freelance Portfolio

React + Vite site with GSAP scroll animations, Lenis smooth scrolling and a three.js hero.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into /dist
```

## Things to edit (all in `src/config.js` and `src/content.js`)

| What | Where |
| --- | --- |
| Name, email, phone, LinkedIn, GitHub | `src/config.js` |
| Your photo | Put `photo.jpg` in `/public`, then set `photo: 'photo.jpg'` in `src/config.js` |
| Services, process, projects, FAQ, skills text | `src/content.js` |
| Colours | CSS variables at the top of `src/styles.css` |

## Make the contact form email you (free, 2 minutes)

1. Go to https://web3forms.com and enter the email address where you want to receive enquiries.
2. They email you an **access key**. Paste it into `web3formsKey` in `src/config.js`.
3. Rebuild and redeploy. Messages now arrive in your inbox when someone clicks **Send message**.

Until a key is added, the form opens the visitor's email app with the message pre-filled.
The access key is meant to be public, so it is safe in a front-end site.

## Deploy for free

### Vercel
1. Push this folder to a GitHub repo.
2. On https://vercel.com choose **Add New → Project**, import the repo.
3. Settings are detected automatically (Vite). Click **Deploy**.

### GitHub Pages
1. Push this folder to a GitHub repo with the default branch named `main`.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push.

## Notes
- Respects "reduce motion" system settings (animations and smooth scrolling switch off).
- The 3D scene loads in a separate chunk so the page text appears first.
