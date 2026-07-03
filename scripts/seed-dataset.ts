import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'public', 'dataset')
const aiDir = join(root, 'ai')
const humanDir = join(root, 'human')

mkdirSync(aiDir, { recursive: true })
mkdirSync(humanDir, { recursive: true })

const palette = {
  ai: [
    ['#00e5ff', '#7c4dff'],
    ['#00bcd4', '#1e88e5'],
    ['#18ffff', '#651fff'],
    ['#22d3ee', '#8b5cf6'],
    ['#06b6d4', '#2563eb'],
  ],
  human: [
    ['#fb7185', '#f59e0b'],
    ['#f97316', '#ec4899'],
    ['#f472b6', '#fb923c'],
    ['#f43f5e', '#eab308'],
    ['#fdba74', '#f9a8d4'],
  ],
} as const

function svg(category: 'ai' | 'human', index: number) {
  const colors = palette[category][index % palette[category].length]
  const accent = category === 'ai' ? '#06111f' : '#261012'
  const shapes = category === 'ai'
    ? `
      <circle cx="72" cy="76" r="38" fill="rgba(255,255,255,0.08)" />
      <rect x="178" y="54" width="68" height="68" rx="18" fill="rgba(255,255,255,0.08)" transform="rotate(12 212 88)" />
      <path d="M38 214 L122 146 L208 182 L262 112" stroke="rgba(255,255,255,0.34)" stroke-width="6" fill="none" stroke-linecap="round" />
      <circle cx="122" cy="146" r="10" fill="#ffffff" opacity="0.8" />
      <circle cx="208" cy="182" r="8" fill="#ffffff" opacity="0.6" />
    `
    : `
      <path d="M38 196 C74 122 112 122 146 166 C178 208 218 208 262 138" stroke="rgba(255,255,255,0.34)" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cx="84" cy="88" r="30" fill="rgba(255,255,255,0.12)" />
      <path d="M178 70 C214 52 250 90 244 130 C238 168 198 188 166 172 C140 160 136 102 178 70Z" fill="rgba(255,255,255,0.1)" />
      <circle cx="208" cy="176" r="16" fill="#ffffff" opacity="0.78" />
    `

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-labelledby="title desc">
  <title>${category.toUpperCase()} sample ${String(index + 1).padStart(2, '0')}</title>
  <desc>Generated ${category} placeholder image</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}" />
      <stop offset="100%" stop-color="${colors[1]}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="300" height="300" rx="34" fill="url(#bg)" />
  <rect width="300" height="300" rx="34" fill="${accent}" opacity="0.5" />
  <circle cx="150" cy="120" r="120" fill="url(#glow)" opacity="0.7" />
  <g opacity="0.95">
    ${shapes}
  </g>
  <g opacity="0.14">
    <circle cx="42" cy="42" r="10" fill="#fff" />
    <circle cx="260" cy="42" r="8" fill="#fff" />
    <circle cx="42" cy="258" r="8" fill="#fff" />
    <circle cx="260" cy="258" r="10" fill="#fff" />
  </g>
</svg>`
}

for (const category of ['ai', 'human'] as const) {
  for (let index = 0; index < 15; index += 1) {
    const filename = `${category}-${String(index + 1).padStart(2, '0')}.svg`
    const dir = category === 'ai' ? aiDir : humanDir
    const filePath = join(dir, filename)
    writeFileSync(filePath, svg(category, index))
  }
}
