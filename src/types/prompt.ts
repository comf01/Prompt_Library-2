export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  favorite: boolean
  copyCount: number
  /** ISO-8601 timestamp */
  createdAt: string
  /** ISO-8601 timestamp */
  updatedAt: string
}

export type PromptDraft = Pick<
  Prompt,
  'title' | 'description' | 'content' | 'category' | 'tags'
>

export type SortOption = 'recent' | 'oldest' | 'title' | 'most-copied'

export interface PromptFilters {
  query: string
  category: string | null
  tags: string[]
  favoritesOnly: boolean
}

export interface Facet {
  value: string
  count: number
}

export const CATEGORIES = [
  'Writing',
  'Engineering',
  'Analysis',
  'Product',
  'Research',
  'Marketing',
  'Personal',
] as const

export const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recently updated',
  oldest: 'Oldest first',
  title: 'Title (A–Z)',
  'most-copied': 'Most copied',
}

export const UNCATEGORIZED = 'Uncategorized'
