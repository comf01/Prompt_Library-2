import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Prompt, PromptDraft } from '@/types/prompt'
import {
  applyDraft,
  createId,
  promptFromDraft,
  collectCategories,
  collectTags,
} from '@/lib/prompt-utils'
import {
  clearStoredPrompts,
  loadPrompts,
  mergePrompts,
  savePrompts,
} from '@/lib/storage'
import { SEED_PROMPTS } from '@/data/seed-prompts'

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>(() => loadPrompts())

  useEffect(() => {
    savePrompts(prompts)
  }, [prompts])

  const createPrompt = useCallback((draft: PromptDraft) => {
    const prompt = promptFromDraft(draft)
    setPrompts((current) => [prompt, ...current])
    return prompt
  }, [])

  const updatePrompt = useCallback((id: string, draft: PromptDraft) => {
    setPrompts((current) =>
      current.map((prompt) =>
        prompt.id === id ? applyDraft(prompt, draft) : prompt,
      ),
    )
  }, [])

  const deletePrompt = useCallback((id: string) => {
    setPrompts((current) => current.filter((prompt) => prompt.id !== id))
  }, [])

  const duplicatePrompt = useCallback((id: string) => {
    setPrompts((current) => {
      const source = current.find((prompt) => prompt.id === id)
      if (!source) return current
      const now = new Date().toISOString()
      const copy: Prompt = {
        ...source,
        id: createId(),
        title: `${source.title} (copy)`,
        favorite: false,
        copyCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      const index = current.findIndex((prompt) => prompt.id === id)
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]
    })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setPrompts((current) =>
      current.map((prompt) =>
        prompt.id === id ? { ...prompt, favorite: !prompt.favorite } : prompt,
      ),
    )
  }, [])

  const registerCopy = useCallback((id: string) => {
    setPrompts((current) =>
      current.map((prompt) =>
        prompt.id === id
          ? { ...prompt, copyCount: prompt.copyCount + 1 }
          : prompt,
      ),
    )
  }, [])

  const importPrompts = useCallback((incoming: Prompt[]) => {
    setPrompts((current) => mergePrompts(current, incoming))
  }, [])

  const resetLibrary = useCallback(() => {
    clearStoredPrompts()
    setPrompts(SEED_PROMPTS)
  }, [])

  const categories = useMemo(() => collectCategories(prompts), [prompts])
  const tags = useMemo(() => collectTags(prompts), [prompts])

  return {
    prompts,
    categories,
    tags,
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    registerCopy,
    importPrompts,
    resetLibrary,
  }
}
