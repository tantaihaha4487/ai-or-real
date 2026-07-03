import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { shuffle } from './utils'
import type { DatasetCategory, DatasetItem } from './dataset-types'

const manifestPath = join(process.cwd(), 'public', 'dataset', 'manifest.json')

export function loadDatasetManifest() {
  const raw = readFileSync(manifestPath, 'utf8')
  const parsed = JSON.parse(raw) as DatasetItem[]
  return parsed.filter((item) => item && item.id && item.path && (item.category === 'ai' || item.category === 'human'))
}

export function pickGameDeck(manifest: DatasetItem[], rounds = 10) {
  if (manifest.length < rounds) {
    throw new Error(`Need at least ${rounds} dataset images`)
  }

  const ai = shuffle(manifest.filter((item) => item.category === 'ai'))
  const human = shuffle(manifest.filter((item) => item.category === 'human'))
  const deck: DatasetItem[] = []

  const targetPerCategory = Math.floor(rounds / 2)
  deck.push(...ai.slice(0, Math.min(targetPerCategory, ai.length)))
  deck.push(...human.slice(0, Math.min(targetPerCategory, human.length)))

  if (deck.length < rounds) {
    const remaining = shuffle(manifest.filter((item) => !deck.some((picked) => picked.id === item.id)))
    deck.push(...remaining.slice(0, rounds - deck.length))
  }

  return shuffle(deck).slice(0, rounds)
}
