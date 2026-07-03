export type DatasetCategory = 'ai' | 'human'

export interface DatasetItem {
  id: string
  filename: string
  category: DatasetCategory
  path: string
}
