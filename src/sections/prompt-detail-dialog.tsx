import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Braces, Check, Copy, Pencil, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { extractVariables, renderPrompt, wordCount } from '@/lib/prompt-utils'
import type { Prompt } from '@/types/prompt'

interface PromptDetailDialogProps {
  prompt: Prompt | null
  open: boolean
  onOpenChange: (open: boolean) => void
  copied: boolean
  onCopy: (text: string) => void
  onEdit: () => void
  onToggleFavorite: () => void
}

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  ...rest
}: PromptDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {prompt && (
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          {/* Keyed on the prompt so filled-in variables reset per prompt. */}
          <PromptDetailBody key={prompt.id} prompt={prompt} {...rest} />
        </DialogContent>
      )}
    </Dialog>
  )
}

type PromptDetailBodyProps = Omit<
  PromptDetailDialogProps,
  'prompt' | 'open' | 'onOpenChange'
> & { prompt: Prompt }

function PromptDetailBody({
  prompt,
  copied,
  onCopy,
  onEdit,
  onToggleFavorite,
}: PromptDetailBodyProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  const variables = useMemo(
    () => extractVariables(prompt.content),
    [prompt.content],
  )
  const rendered = useMemo(
    () => renderPrompt(prompt.content, values),
    [prompt.content, values],
  )
  const filledCount = variables.filter((name) => values[name]?.trim()).length

  return (
    <>
      <DialogHeader className="pr-8">
        <div className="flex items-start gap-2">
          <DialogTitle className="flex-1 text-xl">{prompt.title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onToggleFavorite}
            aria-label={
              prompt.favorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <Star
              className={cn(
                'h-4 w-4',
                prompt.favorite && 'fill-amber-400 text-amber-400',
              )}
            />
          </Button>
        </div>
        {prompt.description && (
          <DialogDescription>{prompt.description}</DialogDescription>
        )}
      </DialogHeader>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="font-normal">
          {prompt.category}
          {prompt.subcategory && (
            <span className="ml-1 opacity-60">· {prompt.subcategory}</span>
          )}
        </Badge>
        {prompt.difficulty && (
          <Badge variant="outline" className="font-normal capitalize">
            {prompt.difficulty}
          </Badge>
        )}
        {prompt.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="font-normal">
            {tag}
          </Badge>
        ))}
      </div>

      {variables.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Braces className="h-4 w-4" /> Fill the variables
              </h3>
              <span className="text-xs text-muted-foreground">
                {filledCount}/{variables.length} filled
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {variables.map((variable) => (
                <div key={variable} className="space-y-1.5">
                  <Label
                    htmlFor={`var-${variable}`}
                    className="font-mono text-xs"
                  >
                    {variable}
                  </Label>
                  <Input
                    id={`var-${variable}`}
                    value={values[variable] ?? ''}
                    placeholder={`value for ${variable}`}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [variable]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            {filledCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setValues({})}
              >
                Reset values
              </Button>
            )}
          </section>
        </>
      )}

      <Separator />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {variables.length > 0 ? 'Preview' : 'Prompt'}
          </h3>
          <span className="text-xs text-muted-foreground">
            {wordCount(rendered)} words · copied {prompt.copyCount}{' '}
            {prompt.copyCount === 1 ? 'time' : 'times'}
          </span>
        </div>
        <pre className="prompt-body max-h-[40vh] overflow-y-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed">
          {rendered}
        </pre>
      </section>

      {prompt.expectedOutput && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">
            What a good response includes
          </h3>
          <p className="rounded-lg border border-dashed p-3 text-sm leading-relaxed text-muted-foreground">
            {prompt.expectedOutput}
          </p>
        </section>
      )}

      {prompt.techniques && prompt.techniques.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          Techniques:
          {prompt.techniques.map((technique) => (
            <code
              key={technique}
              className="rounded bg-muted px-1.5 py-0.5 font-mono"
            >
              {technique}
            </code>
          ))}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Created {format(new Date(prompt.createdAt), 'd MMM yyyy')} · updated{' '}
          {format(new Date(prompt.updatedAt), 'd MMM yyyy')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil /> Edit
          </Button>
          <Button onClick={() => onCopy(rendered)}>
            {copied ? <Check className="text-emerald-400" /> : <Copy />}
            {copied ? 'Copied' : 'Copy prompt'}
          </Button>
        </div>
      </div>
    </>
  )
}
