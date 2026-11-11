# Prepant instructions

- Read `docs/PROGRESS.md` first, then only the relevant sections of `docs/projectbrief.md`.
- This is a strict TypeScript MERN monorepo with npm workspaces: Vite/React 19 client and Express 5/Mongoose server.
- Use Tailwind CSS v4 CSS-first tokens and the existing shadcn/Radix component patterns.
- Keep secrets in ignored `.env` files; update both `.env.example` files when configuration changes.
- Preserve the phase roadmap. Do not rewrite working earlier-phase code or implement later-phase scope early.
- Make precise, small changes, reuse existing helpers, validate every request with Zod, and keep money in integer paise.
- Keep access tokens in memory and refresh tokens in secure httpOnly cookies.
- Use the existing provider interfaces and console fallbacks for local development.
- Do not ask questions; make sensible decisions and add one line to `docs/DECISIONS.md`.
- Update `docs/PROGRESS.md`, `README.md` and `docs/API.md` when behavior or setup changes.
- Commit each coherent chunk with a conventional commit and never push or touch remotes.
- Verify with:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
