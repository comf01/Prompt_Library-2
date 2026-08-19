import type { Prompt } from '@/types/prompt'
import { SEED_PROMPTS } from '@/data/seed-prompts'
import { UNCATEGORIZED } from '@/types/prompt'
import { createId } from '@/lib/prompt-utils'

export const STORAGE_KEY = 'prompt-library.prompts.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asIsoDate(value: unknown): string {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return value
  }
  return new Date().toISOString()
}

/**
 * Coerces unknown input (localStorage or an imported file) into a Prompt.
 * Returns null when the record has no usable content at all.
 */
export function coercePrompt(value: unknown): Prompt | null {
  if (!isRecord(value)) return null

  const content = asString(value.content)
  const title = asString(value.title).trim()
  if (!content.trim() && !title) return null

  const createdAt = asIsoDate(value.createdAt)
  const tags = Array.isArray(value.tags)
    ? Array.from(
        new Set(
          value.tags
            .filter((tag): tag is string => typeof tag === 'string')
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        ),
      )
    : []

  return {
    id: asString(value.id) || createId(),
    title: title || 'Untitled prompt',
    description: asString(value.description),
    content,
    category: asString(value.category).trim() || UNCATEGORIZED,
    tags,
    favorite: value.favorite === true,
    copyCount:
      typeof value.copyCount === 'number' && Number.isFinite(value.copyCount)
        ? Math.max(0, Math.trunc(value.copyCount))
        : 0,
    createdAt,
    updatedAt:
      typeof value.updatedAt === 'string' &&
      !Number.isNaN(Date.parse(value.updatedAt))
        ? value.updatedAt
        : createdAt,
  }
}

export function parsePrompts(raw: string): Prompt[] {
  const parsed: unknown = JSON.parse(raw)
  const list = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.prompts)
      ? parsed.prompts
      : null

  if (!list) {
    throw new Error('Expected a JSON array of prompts.')
  }

  const prompts = list
    .map(coercePrompt)
    .filter((prompt): prompt is Prompt => prompt !== null)

  if (prompts.length === 0) {
    throw new Error('No readable prompts found in that file.')
  }
  return prompts
}

export function loadPrompts(): Prompt[] {
  if (typeof localStorage === 'undefined') return SEED_PROMPTS
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return SEED_PROMPTS
  try {
    return parsePrompts(raw)
  } catch {
    // Corrupt or empty payload: fall back to the seed rather than losing the UI.
    return SEED_PROMPTS
  }
}

export function savePrompts(prompts: Prompt[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
  } catch {
    // Quota exceeded or storage disabled — the in-memory state still works.
  }
}

export function clearStoredPrompts(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function toExportFile(prompts: Prompt[]): string {
  return JSON.stringify({ version: 1, prompts }, null, 2)
}

/** Merges imported prompts into the library, replacing entries with the same id. */
export function mergePrompts(current: Prompt[], incoming: Prompt[]): Prompt[] {
  const byId = new Map(current.map((prompt) => [prompt.id, prompt]))
  for (const prompt of incoming) {
    byId.set(prompt.id, prompt)
  }
  return [...byId.values()]
}
