import { formatDistanceToNow } from 'date-fns'
import {
  Braces,
  Check,
  Copy,
  CopyPlus,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { extractVariables } from '@/lib/prompt-utils'
import type { Prompt } from '@/types/prompt'

interface PromptCardProps {
  prompt: Prompt
  copied: boolean
  onOpen: () => void
  onCopy: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onTagClick: (tag: string) => void
}

export function PromptCard({
  prompt,
  copied,
  onOpen,
  onCopy,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: PromptCardProps) {
  const variables = extractVariables(prompt.content)

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="gap-2 p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >
            <CardTitle className="line-clamp-2 text-base leading-snug hover:underline">
              {prompt.title}
            </CardTitle>
          </button>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleFavorite}
              aria-label={
                prompt.favorite ? 'Remove from favorites' : 'Add to favorites'
              }
              aria-pressed={prompt.favorite}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  prompt.favorite && 'fill-amber-400 text-amber-400',
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Prompt actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <CopyPlus /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {prompt.description && (
          <CardDescription className="line-clamp-2">
            {prompt.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-0">
        <button type="button" onClick={onOpen} className="w-full text-left">
          <p className="prompt-body line-clamp-4 rounded-md bg-muted/60 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {prompt.content}
          </p>
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="font-normal">
            {prompt.category}
          </Badge>
          {prompt.tags.map((tag) => (
            <button key={tag} type="button" onClick={() => onTagClick(tag)}>
              <Badge
                variant="secondary"
                className="cursor-pointer font-normal hover:bg-secondary/70"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t p-3 pl-5">
        <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">
            {formatDistanceToNow(new Date(prompt.updatedAt), {
              addSuffix: true,
            })}
          </span>
          {variables.length > 0 && (
            <span className="flex shrink-0 items-center gap-1">
              <Braces className="h-3 w-3" />
              {variables.length}
            </span>
          )}
          {prompt.copyCount > 0 && (
            <span className="flex shrink-0 items-center gap-1">
              <Copy className="h-3 w-3" />
              {prompt.copyCount}
            </span>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onCopy}>
          {copied ? <Check className="text-emerald-500" /> : <Copy />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </CardFooter>
    </Card>
  )
}
