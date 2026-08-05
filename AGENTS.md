# Agent Instructions & Project Rules

## CRITICAL: Project Architecture & Active Codebase

- **Active Production Directory**: `ai-world-nextjs/`
  - This project has migrated from Vite SPA to Next.js 15+ App Router.
  - Vercel production deployment and live site serving **MUST ONLY** use code inside `ai-world-nextjs/`.
  - **DO NOT** edit root `src/` for production feature requests, navigation updates, or page modifications. Always edit files inside `ai-world-nextjs/` (e.g., `ai-world-nextjs/components/Navbar.jsx`, `ai-world-nextjs/app/`, etc.).
  - Root `src/` is deprecated legacy code retained for reference only.

## Key File Mappings
- **Navbar**: `ai-world-nextjs/components/Navbar.jsx`
- **Footer**: `ai-world-nextjs/components/Footer.jsx`
- **Global Styles**: `ai-world-nextjs/app/globals.css`
- **Translations / i18n**: `ai-world-nextjs/app/LanguageContext.jsx`
- **Pages**: `ai-world-nextjs/app/[route]/page.jsx`

## Build & Verification Command
- When running builds or verifying changes, always run inside `ai-world-nextjs`:
  ```bash
  cd ai-world-nextjs && npm run build
  ```
