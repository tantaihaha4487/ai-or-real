import { redirect } from 'next/navigation'

import { GameClient } from '@/components/game/game-client'
import { loadDatasetManifest, pickGameDeck } from '@/lib/dataset'

export const dynamic = 'force-dynamic'

export default function PlayPage({ searchParams }: { searchParams: { name?: string } }) {
  const playerName = searchParams.name?.trim().slice(0, 24)
  if (!playerName) {
    redirect('/')
  }

  const deck = pickGameDeck(loadDatasetManifest(), 10)
  return <GameClient playerName={playerName} rounds={deck} />
}
