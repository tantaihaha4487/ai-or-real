import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type Category = 'ai' | 'human'

interface ManifestItem {
  id: string
  filename: string
  category: Category
  path: string
}

const root = join(process.cwd(), 'public', 'dataset')

function readCategory(category: Category): ManifestItem[] {
  const dir = join(root, category)
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      id: entry.name.replace(/\.svg$/i, ''),
      filename: entry.name,
      category,
      path: `/dataset/${category}/${entry.name}`,
    }))
}

const manifest = [...readCategory('ai'), ...readCategory('human')]
writeFileSync(join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
