# Plan: AI or Human kiosk game

## What I found
- Repo is empty right now
- No existing Next.js scaffold, config, assets, or git repo to reuse
- Only MCP resource available is Puppeteer console logs; no stronger file/db MCP integration is present

## Constraints to carry into implementation
- Stay on Next.js App Router + TypeScript under `src/`
- Local-only runtime: dataset, sounds, SQLite, no network calls
- Must auto-run after `npm install && npm run dev`
- Need Kanit font and Thai-first UI copy
- User asked for stage commits, but this directory is not a git repo yet; implementation will need to initialize or user must provide repo context before commit-per-stage is possible

## Minimal architecture
- One Next.js app with server components for leaderboard pages and API routes for writes/filtered reads
- SQLite via `better-sqlite3` + Drizzle schema/query layer
- Reducer-driven client game state for the full run lifecycle
- Manifest generated from `public/dataset/{ai,human}` so real images can replace placeholders later
- Placeholder dataset as SVG files only; no extra asset pipeline
- Sound generation in code with Web Audio API first, fallback to tiny local audio assets only if needed

## Dataset storage
- Store source images directly in `public/dataset/ai/` and `public/dataset/human/`
- Treat `public/dataset/manifest.json` as the only runtime index; never hand-edit it
- Keep files flat and stable-name friendly so dropping in real images later is just file replacement + reseed
- Use SVG placeholders first so the whole game ships with zero external asset dependency

## Implementation stages

### 1) Bootstrap app shell
- Create package/config scaffolding for Next.js 14+, strict TypeScript, Tailwind, shadcn/ui baseline, Framer Motion, Drizzle, better-sqlite3
- Add root layout, Kanit font, Thai theme tokens, shared utility helpers
- Add `.gitignore`, env example/docs, data directory handling

### 2) Local dataset + manifest pipeline
- Generate 15 SVG placeholders per category under `public/dataset/ai` and `public/dataset/human`
- Make SVGs readable as stand-ins and support dev-only label watermark via `NEXT_PUBLIC_DEBUG_LABELS`
- Add `scripts/generate-manifest.ts` to scan folders and emit `public/dataset/manifest.json`
- Wire `npm run seed:manifest` and make dev/build depend on manifest presence

### 3) Database auto-init layer
- Define Drizzle schema for `players`, `runs`, `round_results`
- Build `src/db/client.ts` around `better-sqlite3`
- Add init-on-import flow that creates `data/game.db` and ensures tables exist before first query
- Keep this simple: schema + bootstrap call, no manual migration requirement for dev

### 4) Core game logic
- Implement pure scoring helpers with deterministic checks
- Implement dataset helpers: manifest load, unique random picks, preloading, balance rule
- Build reducer state machine for: `name-entry -> preload -> countdown -> playing -> feedback -> finished -> saved`
- Keep round selection simple: shuffle manifest and take 10 unique images; if possible, bias toward near-even split without forcing exact parity

### 5) Game UI screens/components
- Start screen with editable saved name from localStorage
- Countdown overlay, timer ring/bar, image card, AI/HUMAN buttons, hearts, streak toast, round feedback, results screen
- Use Framer Motion for every visible transition/feedback path
- Add kiosk-sized tap targets and laptop-safe responsive layout

### 6) Persistence + leaderboard
- POST route to save player/run/round results
- GET route to fetch top 10 for `all`, `today`, `week`
- Leaderboard UI with tabs and server-driven data rendering

### 7) Sounds + polish
- Implement local-only sound manager with Web Audio API for tick/correct/wrong/streak/heart/game-over/victory
- Add idle attract animation on safe screens if time stays within scope
- Add loading/progress state for image preloading to avoid flicker

### 8) Docs + verification
- README with setup, manifest generation, swapping real images, DB behavior, scoring formula
- Verify `npm run dev` and `npm run build`
- Sanity-check: first-run DB creation, 10-round loop, early hearts loss, leaderboard filters, Thai copy fit, 1080p kiosk layout

## Key decisions
- Use local manifest JSON under `public/` so both server and client can read a stable file
- Prefer server-side DB access only; client saves/fetches through route handlers
- Use Web Audio synthesis instead of shipping sound files unless browser behavior forces a tiny fallback asset
- Reuse a small shadcn subset only where it helps; no extra abstraction beyond cards/buttons/tabs/dialog primitives

## Risks
- `better-sqlite3` must match the local Node version; choose package versions conservatively
- Manifest generation has to run before dev/build, otherwise first boot breaks on a clean clone
- Static SVG files cannot truly react to runtime env on their own; implementation should hide/debug-label via generation strategy or wrapper rendering
- Commit-per-stage is currently blocked by missing git repo and planner-mode restriction

## Acceptance checks
- Clean clone -> `npm install && npm run dev` works with no manual DB/migration/setup steps
- `public/dataset/manifest.json` is generated from folder contents, not handwritten
- Ten unique rounds preload before play starts
- Scoring matches formula exactly
- Hearts end run early at zero
- Results save to SQLite and leaderboard filters work for all/today/week
- No network dependency, no auth, no TODOs/stubs
