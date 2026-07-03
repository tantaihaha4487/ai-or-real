# AGENTS.md

## Repo shape
- Greenfield repo; at the moment the only tracked file is `ses_0daa738a9ffeuogKbA2pIqS9Gu.plan.md`
- Keep future app code under `src/` and local assets under `public/`

## Non-obvious project rules
- Build the game as a fully local Next.js app: no external APIs, no runtime network calls, no auth
- UI copy should be Thai-first, and the app should use the Kanit font
- Store dataset images in `public/dataset/ai/` and `public/dataset/human/`
- Generate `public/dataset/manifest.json` from the filesystem; never hand-edit the manifest
- Keep the SQLite file at `data/game.db`; it should auto-initialize on first use

## When working on the dataset
- Add or replace images directly in the category folders, then rerun the manifest generator
- Treat the manifest as derived output, not source
- If debug labels are needed, keep that behavior in the generator or rendering layer, not in the image files themselves

## Preserve if you add tooling later
- Prefer repo scripts over ad hoc commands
- Keep build/test/typecheck steps in package scripts so future sessions can discover them from `package.json`
