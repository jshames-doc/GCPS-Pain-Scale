# GCPS-R Pain Scale — Repo Guide

## Project
Single-page bilingual (EN/Hebrew) GCPS-R chronic pain questionnaire built with React 19 + Vite + Tailwind CSS v3. All logic lives in a single `App.jsx` (630 lines!). No TypeScript, no test framework, no type checking.

### Technology Stack
- **Framework**: React 19 with hooks (useState, useRef, useMemo, useEffect)
- **Build Tool**: Vite for fast development and production builds
- **Styling**: Tailwind CSS v3 with custom configuration (tailwind.config.js)
- **Animations**: Framer-motion for smooth transitions and animations
- **Icons**: Lucide-react for UI icons
- **Class Handling**: clsx + tailwind-merge with custom `cn()` helper
- **Form Handling**: Custom slider and button components with touch support

### Key Features
- **Bilingual Support**: English and Hebrew with RTL handling
- **Mobile-First**: Responsive design with breakpoints at 768px
- **Auto-Scroll**: 3-second delay for slider questions on desktop, disabled on mobile
- **Scoring System**: PEG Total (Q3+Q4+Q5), PEG Average, GCPS-R Grade 0-3
- **Email Results**: Send results via mailto link to jshames@gmail.com
- **Glassmorphism UI**: Modern glass effect design with clinical colors

## Development Commands (run from `app/`)
- `npm run dev` — dev server with HMR, hot reloads, and optimized builds
- `npm run build` — production build to `app/dist/` with minification
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — preview production build locally

## Project Structure
- **Root**: `app/` directory contains the complete application
- **Source**: `app/src/` — entrypoint `main.jsx` → `App.jsx`
- **Components**: All logic in `App.jsx` with subcomponents:
  - `QuestionContainer` - Animated question wrapper
  - `ChoiceButton` - Multiple choice selection buttons
  - `Slider` - Range slider for pain level questions
- **Translations**: `app/src/translations.js` (flat object, `en`/`he` keys)
- **Styling**: Tailwind utility classes + custom CSS in `index.css` (glassmorphism, range slider)
- **Build Tools**: `vite.config.js`, `postcss.config.js`, `eslint.config.js`

## Key Conventions

### Language & Layout
- **Default language is Hebrew** (`useState('he')`)
- RTL handled via `dir` attribute on root div, no CSS-in-JS complexity
- Language toggle button shows appropriate text based on current language

### Scoring Logic (App.jsx:90-112)
- **PEG Total** = Q3 + Q4 + Q5 (range: 0-30)
- **PEG Average** = total / 3 (range: 0-10)
- **GCPS-R Grade** 0-3 determined by:
  - Grade 0: Not chronic (q1 < 2)
  - Grade 1: Chronic but not high impact, PEG < 12
  - Grade 2: Chronic but not high impact, PEG ≥ 12
  - Grade 3: Chronic and high impact (q1 ≥ 2 AND q2 ≥ 2)

### UI/UX Patterns
- **Slider questions**: 0-10 range with 3-second auto-scroll on desktop
- **No auto-scroll on mobile** (<768px) for better touch experience
- **Touch support**: Optimized for mobile with appropriate delays
- **Form validation**: Real-time progress tracking and completion detection

### Email Integration
- **Results email**: Automatically formatted with all answers and scores
- **Recipient**: jshames@gmail.com via mailto link
- **Format**: Includes all 5 questions, PEG calculations, and grade interpretation

### Class Management
- **cn() helper**: `twMerge(clsx(...))` for conditional class merging
- **Use instead of raw `clsx`** for better Tailwind class handling
- **Component patterns**: Consistent class naming and structure

## Deployment

### Build Process
- `deploy.bat` at repo root: builds from `app/`, then deploys to Cloud Run
- **Build artifacts**: `app/dist/` contains production-ready files
- **Optimization**: Minified bundles, optimized assets

### Cloud Run Deployment
- **Region**: `me-west1`
- **Service**: `gcps-pain-scale`
- **Project**: `gen-lang-client-0026629090`
- **Container**: Docker + Nginx alpine serves `app/dist/`
- **Environment**: Uses envsubst for `$PORT` configuration
- **Caching**: `default.conf.template` disables caching for JS/CSS assets

### Docker Setup
- **Base**: Nginx alpine for production serving
- **Configuration**: `default.conf.template` with envsubst for port substitution
- **Build**: Multi-stage build optimized for size and performance

## Build artifacts
- `dist/` in both root `.gitignore` and app-level `.gitignore` — never commit
- `node_modules/` in root `.gitignore` — never commit
- `build/` directories in both root and app `.gitignore` — never commit

## Development Workflow
1. Clone repository and navigate to `app/` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Use browser to access the application at localhost:5173
5. Make changes to `App.jsx` and watch for hot reloads
6. Run `npm run build` for production builds
7. Run `npm run lint` to check code quality

## Troubleshooting
- **Mobile auto-scroll issues**: Check window.innerWidth < 768px condition
- **RTL layout problems**: Verify `dir` attribute and Hebrew text direction
- **Performance**: Monitor bundle size in production builds
- **Email formatting**: Check generateEmailBody() function for formatting issues
