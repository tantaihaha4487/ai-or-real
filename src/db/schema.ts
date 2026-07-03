import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
})

export const runs = sqliteTable('runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  accuracy: real('accuracy').notNull(),
  avgResponseMs: integer('avg_response_ms').notNull(),
  longestStreak: integer('longest_streak').notNull(),
  heartsRemaining: integer('hearts_remaining').notNull(),
  totalRounds: integer('total_rounds').notNull(),
  correctRounds: integer('correct_rounds').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
})

export const roundResults = sqliteTable('round_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: integer('run_id').notNull().references(() => runs.id, { onDelete: 'cascade' }),
  imageId: text('image_id').notNull(),
  category: text('category', { enum: ['ai', 'human'] }).notNull(),
  playerGuess: text('player_guess', { enum: ['ai', 'human'] }),
  correct: integer('correct', { mode: 'boolean' }).notNull(),
  responseMs: integer('response_ms').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
  streakAtTime: integer('streak_at_time').notNull(),
})
