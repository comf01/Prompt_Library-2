import type {
  Facet,
  Prompt,
  PromptDraft,
  PromptFilters,
  SortOption,
} from '@/types/prompt'
import { UNCATEGORIZED } from '@/types/prompt'

/** Matches `{{ variable_name }}` placeholders inside a prompt body. */
const VARIABLE_PATTERN = /\{\{\s*([\w.-]+)\s*\}\}/g

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `p_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/** Returns the distinct `{{variables}}` in a prompt body, in first-seen order. */
export function extractVariables(content: string): string[] {
  const found: string[] = []
  for (const match of content.matchAll(VARIABLE_PATTERN)) {
    const name = match[1]
    if (!found.includes(name)) found.push(name)
  }
  return found
}

/**
 * Substitutes variable values into a prompt body. Variables without a value
 * are left as-is so the placeholder stays visible in the preview.
 */
export function renderPrompt(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(VARIABLE_PATTERN, (placeholder, name: string) => {
    const value = values[name]
    return value != null && value.trim() !== '' ? value : placeholder
  })
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-')
}

export function parseTags(input: string): string[] {
  const tags = input
    .split(',')
    .map(normalizeTag)
    .filter((tag) => tag.length > 0)
  return Array.from(new Set(tags))
}

function matchesQuery(prompt: Prompt, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = [
    prompt.title,
    prompt.description,
    prompt.content,
    prompt.category,
    prompt.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

export function filterPrompts(
  prompts: Prompt[],
  filters: PromptFilters,
): Prompt[] {
  return prompts.filter((prompt) => {
    if (filters.favoritesOnly && !prompt.favorite) return false
    if (filters.category && prompt.category !== filters.category) return false
    if (
      filters.tags.length > 0 &&
      !filters.tags.every((tag) => prompt.tags.includes(tag))
    ) {
      return false
    }
    return matchesQuery(prompt, filters.query)
  })
}

export function sortPrompts(prompts: Prompt[], sort: SortOption): Prompt[] {
  const sorted = [...prompts]
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'title':
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
      )
    case 'most-copied':
      return sorted.sort(
        (a, b) =>
          b.copyCount - a.copyCount || b.updatedAt.localeCompare(a.updatedAt),
      )
  }
}

function toFacets(values: string[]): Facet[] {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export function collectCategories(prompts: Prompt[]): Facet[] {
  return toFacets(prompts.map((prompt) => prompt.category || UNCATEGORIZED))
}

export function collectTags(prompts: Prompt[]): Facet[] {
  return toFacets(prompts.flatMap((prompt) => prompt.tags))
}

export function draftFromPrompt(prompt: Prompt): PromptDraft {
  return {
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
  }
}

export function emptyDraft(): PromptDraft {
  return {
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
  }
}

export function promptFromDraft(draft: PromptDraft): Prompt {
  const now = new Date().toISOString()
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    content: draft.content,
    category: draft.category.trim() || UNCATEGORIZED,
    tags: draft.tags,
    favorite: false,
    copyCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyDraft(prompt: Prompt, draft: PromptDraft): Prompt {
  return {
    ...prompt,
    title: draft.title.trim(),
    description: draft.description.trim(),
    content: draft.content,
    category: draft.category.trim() || UNCATEGORIZED,
    tags: draft.tags,
    updatedAt: new Date().toISOString(),
  }
}

export function wordCount(content: string): number {
  return content.trim() ? content.trim().split(/\s+/).length : 0
}
