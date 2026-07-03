import 'server-only'

import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { roundResults, runs, players } from './schema'

const dbPath = join(process.cwd(), 'data', 'game.db')
mkdirSync(dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)

sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
sqlite.exec(`
  create table if not exists players (
    id integer primary key autoincrement,
    name text not null,
    created_at integer not null
  );
  create table if not exists runs (
    id integer primary key autoincrement,
    player_id integer not null references players(id) on delete cascade,
    score integer not null,
    accuracy real not null,
    avg_response_ms integer not null,
    longest_streak integer not null,
    hearts_remaining integer not null,
    total_rounds integer not null,
    correct_rounds integer not null,
    created_at integer not null
  );
  create table if not exists round_results (
    id integer primary key autoincrement,
    run_id integer not null references runs(id) on delete cascade,
    image_id text not null,
    category text not null check (category in ('ai', 'human')),
    player_guess text check (player_guess in ('ai', 'human')),
    correct integer not null check (correct in (0, 1)),
    response_ms integer not null,
    points_awarded integer not null,
    streak_at_time integer not null
  );
  create index if not exists idx_runs_created_at on runs(created_at desc);
  create index if not exists idx_round_results_run_id on round_results(run_id);
`)

export const db = drizzle(sqlite)
export { sqlite, dbPath, players, runs, roundResults }
