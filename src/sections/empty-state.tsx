import { FileQuestion, Plus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  filtered: boolean
  onCreate: () => void
  onResetFilters: () => void
}

export function EmptyState({
  filtered,
  onCreate,
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">
        {filtered ? 'No prompts match those filters' : 'Your library is empty'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'Try a different search term, or clear the active filters to see everything.'
          : 'Add your first prompt — it stays in this browser, no account needed.'}
      </p>
      <div className="mt-5 flex gap-2">
        {filtered ? (
          <Button variant="outline" onClick={onResetFilters}>
            <RotateCcw /> Clear filters
          </Button>
        ) : null}
        <Button onClick={onCreate}>
          <Plus /> New prompt
        </Button>
      </div>
    </div>
  )
}
