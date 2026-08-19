import { describe, expect, it } from 'vitest'

import {
  collectTags,
  extractVariables,
  filterPrompts,
  parseTags,
  renderPrompt,
  sortPrompts,
  wordCount,
} from '@/lib/prompt-utils'
import type { Prompt } from '@/types/prompt'

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: 'p1',
    title: 'Code review',
    description: 'Reviews a diff',
    content: 'Review this {{language}} diff: {{diff}}',
    category: 'Engineering',
    tags: ['code-review', 'quality'],
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('extractVariables', () => {
  it('returns distinct variables in first-seen order', () => {
    const content = 'Hi {{name}}, {{topic}} and {{name}} again'
    expect(extractVariables(content)).toEqual(['name', 'topic'])
  })

  it('tolerates whitespace inside the braces', () => {
    expect(extractVariables('{{  spaced_name  }}')).toEqual(['spaced_name'])
  })

  it('ignores single braces and empty placeholders', () => {
    expect(extractVariables('{nope} {{}} {{ }}')).toEqual([])
  })
})

describe('renderPrompt', () => {
  it('substitutes provided values', () => {
    expect(renderPrompt('Hello {{name}}', { name: 'Ada' })).toBe('Hello Ada')
  })

  it('leaves the placeholder when a value is missing or blank', () => {
    expect(renderPrompt('Hello {{name}}', {})).toBe('Hello {{name}}')
    expect(renderPrompt('Hello {{name}}', { name: '   ' })).toBe(
      'Hello {{name}}',
    )
  })

  it('replaces every occurrence of the same variable', () => {
    expect(renderPrompt('{{a}} and {{a}}', { a: 'x' })).toBe('x and x')
  })

  it('does not re-expand braces contained in a substituted value', () => {
    expect(renderPrompt('{{a}}', { a: '{{b}}' })).toBe('{{b}}')
  })
})

describe('parseTags', () => {
  it('splits, normalizes, and dedupes', () => {
    expect(parseTags('Code Review, quality , code-review, ')).toEqual([
      'code-review',
      'quality',
    ])
  })

  it('returns an empty list for blank input', () => {
    expect(parseTags('  ,  ')).toEqual([])
  })
})

describe('filterPrompts', () => {
  const prompts = [
    makePrompt({ id: 'a', title: 'Code review', favorite: true }),
    makePrompt({
      id: 'b',
      title: 'Launch email',
      category: 'Marketing',
      tags: ['email'],
      content: 'Write a launch email',
      description: '',
    }),
  ]
  const base = {
    query: '',
    category: null,
    tags: [] as string[],
    favoritesOnly: false,
  }

  it('matches across title, body, category, and tags', () => {
    expect(filterPrompts(prompts, { ...base, query: 'launch' })).toHaveLength(1)
    expect(
      filterPrompts(prompts, { ...base, query: 'marketing' }),
    ).toHaveLength(1)
    expect(filterPrompts(prompts, { ...base, query: 'quality' })).toHaveLength(
      1,
    )
  })

  it('requires every search term to match (AND, not OR)', () => {
    expect(
      filterPrompts(prompts, { ...base, query: 'launch email' }),
    ).toHaveLength(1)
    expect(
      filterPrompts(prompts, { ...base, query: 'launch review' }),
    ).toHaveLength(0)
  })

  it('requires every selected tag to be present', () => {
    expect(
      filterPrompts(prompts, { ...base, tags: ['code-review', 'quality'] }),
    ).toHaveLength(1)
    expect(
      filterPrompts(prompts, { ...base, tags: ['code-review', 'email'] }),
    ).toHaveLength(0)
  })

  it('combines category and favorites filters', () => {
    expect(
      filterPrompts(prompts, { ...base, category: 'Marketing' }),
    ).toHaveLength(1)
    expect(filterPrompts(prompts, { ...base, favoritesOnly: true })).toEqual([
      prompts[0],
    ])
  })
})

describe('sortPrompts', () => {
  const older = makePrompt({
    id: 'older',
    title: 'Zebra',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
    copyCount: 9,
  })
  const newer = makePrompt({
    id: 'newer',
    title: 'Alpha',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    copyCount: 2,
  })
  const prompts = [older, newer]

  it('sorts by most recently updated', () => {
    expect(sortPrompts(prompts, 'recent').map((p) => p.id)).toEqual([
      'newer',
      'older',
    ])
  })

  it('sorts by oldest created', () => {
    expect(sortPrompts(prompts, 'oldest').map((p) => p.id)).toEqual([
      'older',
      'newer',
    ])
  })

  it('sorts by title and by copy count', () => {
    expect(sortPrompts(prompts, 'title').map((p) => p.id)).toEqual([
      'newer',
      'older',
    ])
    expect(sortPrompts(prompts, 'most-copied').map((p) => p.id)).toEqual([
      'older',
      'newer',
    ])
  })

  it('does not mutate the input array', () => {
    const input = [older, newer]
    sortPrompts(input, 'title')
    expect(input.map((p) => p.id)).toEqual(['older', 'newer'])
  })
})

describe('collectTags', () => {
  it('counts tags and orders by frequency then name', () => {
    const prompts = [
      makePrompt({ id: '1', tags: ['a', 'b'] }),
      makePrompt({ id: '2', tags: ['b'] }),
      makePrompt({ id: '3', tags: ['b', 'c'] }),
    ]
    expect(collectTags(prompts)).toEqual([
      { value: 'b', count: 3 },
      { value: 'a', count: 1 },
      { value: 'c', count: 1 },
    ])
  })
})

describe('wordCount', () => {
  it('counts words and handles blank input', () => {
    expect(wordCount('  one two   three ')).toBe(3)
    expect(wordCount('   ')).toBe(0)
  })
})
