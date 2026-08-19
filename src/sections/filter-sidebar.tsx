import { useState } from 'react'
import { Gauge, Star, Tag, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Difficulty, Facet } from '@/types/prompt'

/** Tags shown before the viewer expands the full list. */
const TAG_PREVIEW_COUNT = 30

interface FilterSidebarProps {
  categories: Facet[]
  tags: Facet[]
  difficulties: Facet[]
  activeCategory: string | null
  activeTags: string[]
  activeDifficulty: Difficulty | null
  favoritesOnly: boolean
  favoriteCount: number
  total: number
  onCategoryChange: (category: string | null) => void
  onTagToggle: (tag: string) => void
  onDifficultyChange: (difficulty: Difficulty | null) => void
  onFavoritesToggle: () => void
  onReset: () => void
}

export function FilterSidebar({
  categories,
  tags,
  difficulties,
  activeCategory,
  activeTags,
  activeDifficulty,
  favoritesOnly,
  favoriteCount,
  total,
  onCategoryChange,
  onTagToggle,
  onDifficultyChange,
  onFavoritesToggle,
  onReset,
}: FilterSidebarProps) {
  const [allTagsShown, setAllTagsShown] = useState(false)

  const hasFilters =
    activeCategory !== null ||
    activeTags.length > 0 ||
    activeDifficulty !== null ||
    favoritesOnly

  // Selected tags stay visible even when the list is collapsed.
  const visibleTags = allTagsShown
    ? tags
    : tags.filter(
        (tag, index) =>
          index < TAG_PREVIEW_COUNT || activeTags.includes(tag.value),
      )

  return (
    <aside className="lg:sticky lg:top-[9.5rem] lg:h-[calc(100vh-11rem)]">
      <div className="flex h-full flex-col gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filters</h2>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onReset}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={onFavoritesToggle}
          className={cn(
            'flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
            favoritesOnly
              ? 'border-transparent bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <span className="flex items-center gap-2">
            <Star
              className={cn('h-4 w-4', favoritesOnly && 'fill-current')}
              aria-hidden
            />
            Favorites
          </span>
          <span className="text-xs opacity-80">{favoriteCount}</span>
        </button>

        {difficulties.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <h3 className="flex items-center gap-1.5 px-1 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Gauge className="h-3 w-3" /> Difficulty
              </h3>
              {difficulties.map((facet) => (
                <FilterRow
                  key={facet.value}
                  label={facet.value}
                  count={facet.count}
                  active={activeDifficulty === facet.value}
                  className="capitalize"
                  onClick={() =>
                    onDifficultyChange(
                      activeDifficulty === facet.value
                        ? null
                        : (facet.value as Difficulty),
                    )
                  }
                />
              ))}
            </div>
          </>
        )}

        <Separator />

        <div className="min-h-0 flex-shrink overflow-y-auto">
          <div className="space-y-1">
            <h3 className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Categories
            </h3>
            <FilterRow
              label="All prompts"
              count={total}
              active={activeCategory === null}
              onClick={() => onCategoryChange(null)}
            />
            {categories.map((category) => (
              <FilterRow
                key={category.value}
                label={category.value}
                count={category.count}
                active={activeCategory === category.value}
                onClick={() =>
                  onCategoryChange(
                    activeCategory === category.value ? null : category.value,
                  )
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex min-h-0 flex-1 flex-col">
          <h3 className="flex items-center gap-1.5 px-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Tag className="h-3 w-3" /> Tags
          </h3>
          {tags.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">No tags yet.</p>
          ) : (
            <ScrollArea className="min-h-0 flex-1 lg:max-h-none">
              <div className="flex flex-wrap gap-1.5 pr-3">
                {visibleTags.map((tag) => {
                  const active = activeTags.includes(tag.value)
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => onTagToggle(tag.value)}
                      aria-pressed={active}
                    >
                      <Badge
                        variant={active ? 'default' : 'secondary'}
                        className="cursor-pointer font-normal"
                      >
                        {tag.value}
                        <span className="ml-1 opacity-60">{tag.count}</span>
                      </Badge>
                    </button>
                  )
                })}
                {tags.length > TAG_PREVIEW_COUNT && (
                  <button
                    type="button"
                    className="rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setAllTagsShown((value) => !value)}
                  >
                    {allTagsShown
                      ? 'Show fewer'
                      : `Show all ${tags.length} tags`}
                  </button>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </aside>
  )
}

function FilterRow({
  label,
  count,
  active,
  className,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-secondary font-medium text-secondary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <span className="ml-2 text-xs tabular-nums opacity-70">{count}</span>
    </button>
  )
}
