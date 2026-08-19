import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import './App.css'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { usePrompts } from '@/hooks/use-prompts'
import { filterPrompts, sortPrompts } from '@/lib/prompt-utils'
import { parsePrompts, toExportFile } from '@/lib/storage'
import { EmptyState } from '@/sections/empty-state'
import { FilterSidebar } from '@/sections/filter-sidebar'
import { LibraryHeader } from '@/sections/library-header'
import { PromptCard } from '@/sections/prompt-card'
import { PromptDetailDialog } from '@/sections/prompt-detail-dialog'
import { PromptEditorDialog } from '@/sections/prompt-editor-dialog'
import type { Prompt, PromptDraft, SortOption } from '@/types/prompt'

export default function App() {
  const {
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
  } = usePrompts()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState<SortOption>('recent')

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Prompt | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const { copy, copiedId } = useCopyToClipboard()

  const visiblePrompts = useMemo(
    () =>
      sortPrompts(
        filterPrompts(prompts, {
          query,
          category,
          tags: activeTags,
          favoritesOnly,
        }),
        sort,
      ),
    [prompts, query, category, activeTags, favoritesOnly, sort],
  )

  const editingPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === editingId) ?? null,
    [prompts, editingId],
  )
  const detailPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === detailId) ?? null,
    [prompts, detailId],
  )
  const favoriteCount = useMemo(
    () => prompts.filter((prompt) => prompt.favorite).length,
    [prompts],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const resetFilters = useCallback(() => {
    setQuery('')
    setCategory(null)
    setActiveTags([])
    setFavoritesOnly(false)
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    )
  }, [])

  const handleCopy = useCallback(
    async (prompt: Prompt, text?: string) => {
      const ok = await copy(text ?? prompt.content, prompt.id)
      if (ok) {
        registerCopy(prompt.id)
        toast.success('Copied to clipboard', { description: prompt.title })
      } else {
        toast.error('Could not access the clipboard')
      }
    },
    [copy, registerCopy],
  )

  const handleSubmitDraft = useCallback(
    (draft: PromptDraft) => {
      if (editingPrompt) {
        updatePrompt(editingPrompt.id, draft)
        toast.success('Prompt updated', { description: draft.title })
      } else {
        const created = createPrompt(draft)
        toast.success('Prompt added', { description: created.title })
      }
      setEditingId(null)
    },
    [createPrompt, editingPrompt, updatePrompt],
  )

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const incoming = parsePrompts(await file.text())
        importPrompts(incoming)
        toast.success(
          `Imported ${incoming.length} ${incoming.length === 1 ? 'prompt' : 'prompts'}`,
        )
      } catch (error) {
        toast.error('Import failed', {
          description:
            error instanceof Error ? error.message : 'Unreadable JSON file.',
        })
      }
    },
    [importPrompts],
  )

  const handleExport = useCallback(() => {
    const blob = new Blob([toExportFile(prompts)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${prompts.length} prompts`)
  }, [prompts])

  const openEditor = useCallback((prompt: Prompt | null) => {
    setEditingId(prompt?.id ?? null)
    setEditorOpen(true)
  }, [])

  const filtersActive =
    query.trim() !== '' ||
    category !== null ||
    activeTags.length > 0 ||
    favoritesOnly

  return (
    <div className="app-shell">
      <LibraryHeader
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        onCreate={() => openEditor(null)}
        onImport={handleImport}
        onExport={handleExport}
        searchRef={searchRef}
        total={prompts.length}
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:px-8">
        <FilterSidebar
          categories={categories}
          tags={tags}
          activeCategory={category}
          activeTags={activeTags}
          favoritesOnly={favoritesOnly}
          favoriteCount={favoriteCount}
          total={prompts.length}
          onCategoryChange={setCategory}
          onTagToggle={toggleTag}
          onFavoritesToggle={() => setFavoritesOnly((value) => !value)}
          onReset={resetFilters}
        />

        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {visiblePrompts.length} of {prompts.length}
              {filtersActive ? ' (filtered)' : ''}
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {visiblePrompts.length === 0 ? (
            <EmptyState
              filtered={filtersActive}
              onCreate={() => openEditor(null)}
              onResetFilters={resetFilters}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  copied={copiedId === prompt.id}
                  onOpen={() => setDetailId(prompt.id)}
                  onCopy={() => void handleCopy(prompt)}
                  onEdit={() => openEditor(prompt)}
                  onDuplicate={() => {
                    duplicatePrompt(prompt.id)
                    toast.success('Prompt duplicated')
                  }}
                  onDelete={() => setPendingDelete(prompt)}
                  onToggleFavorite={() => toggleFavorite(prompt.id)}
                  onTagClick={toggleTag}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <PromptEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) setEditingId(null)
        }}
        prompt={editingPrompt}
        knownCategories={categories.map((facet) => facet.value)}
        onSubmit={handleSubmitDraft}
      />

      <PromptDetailDialog
        prompt={detailPrompt}
        open={detailPrompt !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        copied={copiedId === detailPrompt?.id}
        onCopy={(text) => {
          if (detailPrompt) void handleCopy(detailPrompt, text)
        }}
        onEdit={() => {
          if (!detailPrompt) return
          setDetailId(null)
          openEditor(detailPrompt)
        }}
        onToggleFavorite={() => {
          if (detailPrompt) toggleFavorite(detailPrompt.id)
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be removed from this browser. Export
              first if you want a copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!pendingDelete) return
                deletePrompt(pendingDelete.id)
                toast.success('Prompt deleted', {
                  description: pendingDelete.title,
                })
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-right" />
    </div>
  )
}
