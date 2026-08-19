export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  subcategory?: string
  tags: string[]
  difficulty?: Difficulty
  /** What a good response to this prompt should contain. */
  expectedOutput?: string
  /** Prompt-design techniques the prompt applies (see docs/). */
  techniques?: string[]
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
> & { difficulty?: Difficulty }

export type SortOption = 'recent' | 'oldest' | 'title' | 'most-copied'

export interface PromptFilters {
  query: string
  category: string | null
  tags: string[]
  difficulty: Difficulty | null
  favoritesOnly: boolean
}

export interface Facet {
  value: string
  count: number
}

export const CATEGORIES = [
  'APIs',
  'Architecture',
  'Automation',
  'Backend',
  'Code Review',
  'Databases',
  'Debugging',
  'Dev Workflows',
  'DevOps',
  'Frontend',
  'Full-Stack',
  'Performance',
  'Refactoring',
  'Security',
  'Testing',
  'UI/UX Implementation',
] as const

export const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recently updated',
  oldest: 'Oldest first',
  title: 'Title (A–Z)',
  'most-copied': 'Most copied',
}

export const UNCATEGORIZED = 'Uncategorized'
