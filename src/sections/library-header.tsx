import { useRef } from 'react'
import { Download, Library, Plus, Search, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SortOption } from '@/types/prompt'
import { SORT_LABELS } from '@/types/prompt'

interface LibraryHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  onCreate: () => void
  onImport: (file: File) => void
  onExport: () => void
  searchRef: React.RefObject<HTMLInputElement | null>
  total: number
}

export function LibraryHeader({
  query,
  onQueryChange,
  sort,
  onSortChange,
  onCreate,
  onImport,
  onExport,
  searchRef,
  total,
}: LibraryHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight tracking-tight">
                Prompt Library
              </h1>
              <p className="text-xs text-muted-foreground">
                {total} {total === 1 ? 'prompt' : 'prompts'} · saved in this
                browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onImport(file)
                event.target.value = ''
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download /> Export
            </Button>
            <ModeToggle />
            <Button size="sm" onClick={onCreate}>
              <Plus /> New prompt
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search titles, bodies, and tags…   (⌘K)"
              className="h-10 pl-9 pr-9"
              aria-label="Search prompts"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger className="h-10 sm:w-[190px]" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
