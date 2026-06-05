# GCPS-R Pain Scale — Repo Guide

## Project
Single-page bilingual (EN/Hebrew) GCPS-R chronic pain questionnaire built with React 19 + Vite + Tailwind CSS v3. All logic lives in a single `App.jsx`. No TypeScript, no test framework, no type checking.

## Commands (run from `app/`)
- `npm run dev` — dev server with HMR
- `npm run build` — production build to `app/dist/`
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — preview production build locally

## Structure
- All source in `app/src/` — entrypoint `main.jsx` → `App.jsx`
- Translations in `app/src/translations.js` (flat object, `en`/`he` keys)
- Styling: Tailwind utility classes + custom CSS in `index.css` (glassmorphism, range slider)

## Key conventions
- **Default language is Hebrew** (`useState('he')`)
- RTL handled via `dir` attribute on root div, no CSS-in-JS complexity
- Slider questions: 0-10 range, auto-scroll to next after 3s delay on desktop, **no auto-scroll on mobile** (<768px)
- PEG Total = Q3+Q4+Q5. PEG Avg = total/3. GCPS-R Grade 0-3 (see scoring in `App.jsx:89-111`)
- Email results sent to `jshames@gmail.com` via `mailto:` link
- `cn()` helper = `twMerge(clsx(...))` for conditional class merging; use it instead of raw `clsx`

## Deployment
- `deploy.bat` at repo root: builds from `app/`, then deploys to Cloud Run
  - Region: `me-west1`, service: `gcps-pain-scale`, project: `gen-lang-client-0026629090`
- Docker + Nginx alpine serves `app/dist/`, uses envsubst for `$PORT`
- `default.conf.template` disables caching for JS/CSS assets

## Build artifacts
- `dist/` in both root `.gitignore` and app-level `.gitignore` — never commit
