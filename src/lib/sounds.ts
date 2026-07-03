export type SoundName = 'tick' | 'correct' | 'wrong' | 'combo' | 'heart' | 'gameover' | 'victory'

type SoundPlayer = {
  unlock: () => Promise<void>
  play: (name: SoundName) => void
}

const frequencies: Record<SoundName, number[]> = {
  tick: [1200],
  correct: [740, 988],
  wrong: [220, 165],
  combo: [660, 880, 1320],
  heart: [180],
  gameover: [330, 247, 196],
  victory: [523, 659, 784, 1046],
}

function envAudioContext() {
  if (typeof window === 'undefined') return null
  return window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null
}

export function createSoundPlayer(): SoundPlayer {
  let context: AudioContext | null = null

  const ensureContext = async () => {
    if (context) return context
    const Ctor = envAudioContext()
    if (!Ctor) return null
    context = new Ctor()
    if (context.state === 'suspended') {
      await context.resume()
    }
    return context
  }

  const tone = async (name: SoundName) => {
    const audio = await ensureContext()
    if (!audio) return

    const gain = audio.createGain()
    gain.connect(audio.destination)
    gain.gain.value = 0.0001
    gain.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + 0.02)

    frequencies[name].forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      oscillator.type = name === 'wrong' || name === 'gameover' ? 'sawtooth' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime + index * 0.08)
      oscillator.connect(gain)
      oscillator.start(audio.currentTime + index * 0.08)
      oscillator.stop(audio.currentTime + index * 0.08 + 0.12)
    })

    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.5)
  }

  return {
    unlock: async () => {
      await ensureContext()
    },
    play: (name: SoundName) => {
      void tone(name)
    },
  }
}
