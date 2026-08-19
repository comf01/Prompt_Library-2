import type { Difficulty, Prompt } from '@/types/prompt'
import library from './prompt-library.json'

/**
 * The library the app ships with: the Fable-5 Web Development Prompt Library
 * (272 prompts, 16 categories — see docs/ for its design and evaluation
 * reports). The JSON file is kept verbatim; this module maps its schema onto
 * the app's Prompt type. Timestamps come from the library's generatedAt so a
 * fresh install always sorts the same way.
 */

interface LibraryRecord {
  id: string
  title: string
  category: string
  subcategory?: string
  description: string
  prompt: string
  tags: string[]
  difficulty?: string
  expectedOutput?: string
  fable5Techniques?: string[]
}

interface LibraryFile {
  generatedAt?: string
  prompts: LibraryRecord[]
}

const file = library as LibraryFile
const generatedAt = file.generatedAt ?? '2026-08-19T00:00:00.000Z'

function asDifficulty(value: string | undefined): Difficulty | undefined {
  return value === 'beginner' ||
    value === 'intermediate' ||
    value === 'advanced'
    ? value
    : undefined
}

export const SEED_PROMPTS: Prompt[] = file.prompts.map((record) => ({
  id: record.id,
  title: record.title,
  description: record.description,
  content: record.prompt,
  category: record.category,
  subcategory: record.subcategory,
  tags: record.tags,
  difficulty: asDifficulty(record.difficulty),
  expectedOutput: record.expectedOutput,
  techniques: record.fable5Techniques,
  favorite: false,
  copyCount: 0,
  createdAt: generatedAt,
  updatedAt: generatedAt,
}))
