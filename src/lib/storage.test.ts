import { beforeEach, describe, expect, it } from 'vitest'

import {
  SEED_VERSION,
  SEED_VERSION_KEY,
  STORAGE_KEY,
  coercePrompt,
  loadPrompts,
  mergePrompts,
  parsePrompts,
  savePrompts,
  toExportFile,
} from '@/lib/storage'
import { SEED_PROMPTS } from '@/data/seed-prompts'
import type { Prompt } from '@/types/prompt'

const validPrompt = {
  id: 'x1',
  title: 'Imported',
  description: 'desc',
  content: 'body {{v}}',
  category: 'Writing',
  tags: ['One', ' two ', 'one'],
  favorite: true,
  copyCount: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
}

describe('coercePrompt', () => {
  it('normalizes tags and keeps valid fields', () => {
    const prompt = coercePrompt(validPrompt)
    expect(prompt).not.toBeNull()
    expect(prompt?.tags).toEqual(['one', 'two'])
    expect(prompt?.copyCount).toBe(3)
    expect(prompt?.favorite).toBe(true)
  })

  it('fills in defaults for missing fields', () => {
    const prompt = coercePrompt({ content: 'just a body' })
    expect(prompt?.title).toBe('Untitled prompt')
    expect(prompt?.category).toBe('Uncategorized')
    expect(prompt?.id).toBeTruthy()
    expect(prompt?.updatedAt).toBe(prompt?.createdAt)
  })

  it('rejects records with no title and no content', () => {
    expect(coercePrompt({ title: '   ', content: '  ' })).toBeNull()
    expect(coercePrompt('nope')).toBeNull()
    expect(coercePrompt(null)).toBeNull()
  })

  it('accepts the raw library schema (prompt / fable5Techniques fields)', () => {
    const prompt = coercePrompt({
      id: 'API-001',
      title: 'REST Resource Endpoint Set Design',
      category: 'APIs',
      subcategory: 'REST endpoint design',
      description: 'Design a CRUD endpoint set.',
      prompt: '<task>...</task>',
      tags: ['rest', 'crud'],
      difficulty: 'intermediate',
      expectedOutput: 'An endpoint table.',
      fable5Techniques: ['output-contract', 'negative-constraints'],
    })
    expect(prompt?.content).toBe('<task>...</task>')
    expect(prompt?.subcategory).toBe('REST endpoint design')
    expect(prompt?.difficulty).toBe('intermediate')
    expect(prompt?.expectedOutput).toBe('An endpoint table.')
    expect(prompt?.techniques).toEqual([
      'output-contract',
      'negative-constraints',
    ])
  })

  it('drops an unknown difficulty value instead of storing it', () => {
    expect(
      coercePrompt({ ...validPrompt, difficulty: 'impossible' })?.difficulty,
    ).toBeUndefined()
  })

  it('clamps a nonsensical copy count', () => {
    expect(coercePrompt({ ...validPrompt, copyCount: -4 })?.copyCount).toBe(0)
    expect(coercePrompt({ ...validPrompt, copyCount: 'many' })?.copyCount).toBe(
      0,
    )
  })
})

describe('parsePrompts', () => {
  it('reads a bare array and an export envelope alike', () => {
    expect(parsePrompts(JSON.stringify([validPrompt]))).toHaveLength(1)
    expect(
      parsePrompts(JSON.stringify({ version: 1, prompts: [validPrompt] })),
    ).toHaveLength(1)
  })

  it('round-trips an exported file', () => {
    const prompts = parsePrompts(toExportFile(SEED_PROMPTS))
    expect(prompts).toHaveLength(SEED_PROMPTS.length)
    expect(prompts[0].title).toBe(SEED_PROMPTS[0].title)
  })

  it('throws on shapes it cannot use', () => {
    expect(() => parsePrompts('{"nope":true}')).toThrow()
    expect(() => parsePrompts('[]')).toThrow()
    expect(() => parsePrompts('[{"title":"  "}]')).toThrow()
  })
})

describe('localStorage round trip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the seed library when nothing is stored', () => {
    expect(loadPrompts()).toEqual(SEED_PROMPTS)
  })

  it('reloads what was saved', () => {
    const stored: Prompt[] = [{ ...validPrompt, tags: ['one'] }]
    savePrompts(stored)
    expect(loadPrompts()).toEqual(stored)
  })

  it('falls back to the seed when the stored payload is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{ not json')
    expect(loadPrompts()).toEqual(SEED_PROMPTS)
  })

  it('merges new seed prompts into a pre-marker stored library once', () => {
    // A library saved by an older app version: no seed-version marker.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([validPrompt]))
    const migrated = loadPrompts()
    expect(migrated).toHaveLength(1 + SEED_PROMPTS.length)
    expect(migrated[0].id).toBe(validPrompt.id)

    // Saving stamps the marker; deletions now stick across reloads.
    savePrompts(migrated.slice(0, 5))
    expect(localStorage.getItem(SEED_VERSION_KEY)).toBe(String(SEED_VERSION))
    expect(loadPrompts()).toHaveLength(5)
  })

  it('does not overwrite a user-edited prompt that shares a seed id', () => {
    const edited = { ...validPrompt, id: SEED_PROMPTS[0].id, title: 'Mine' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([edited]))
    const migrated = loadPrompts()
    expect(migrated.find((p) => p.id === SEED_PROMPTS[0].id)?.title).toBe(
      'Mine',
    )
    expect(migrated).toHaveLength(SEED_PROMPTS.length)
  })
})

describe('mergePrompts', () => {
  it('replaces entries with a matching id and appends the rest', () => {
    const current: Prompt[] = [
      { ...validPrompt, title: 'Original' },
      { ...validPrompt, id: 'x2', title: 'Untouched' },
    ]
    const incoming: Prompt[] = [
      { ...validPrompt, title: 'Replaced' },
      { ...validPrompt, id: 'x3', title: 'Added' },
    ]
    const merged = mergePrompts(current, incoming)
    expect(merged).toHaveLength(3)
    expect(merged.find((p) => p.id === 'x1')?.title).toBe('Replaced')
    expect(merged.map((p) => p.id)).toEqual(['x1', 'x2', 'x3'])
  })
})
