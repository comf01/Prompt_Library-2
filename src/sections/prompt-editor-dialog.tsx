import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Braces } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { extractVariables, parseTags } from '@/lib/prompt-utils'
import type { Prompt, PromptDraft } from '@/types/prompt'
import { CATEGORIES, UNCATEGORIZED } from '@/types/prompt'

const promptFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the prompt a title.')
    .max(120, 'Keep the title under 120 characters.'),
  description: z.string().max(280, 'Keep the summary under 280 characters.'),
  category: z.string().trim().min(1, 'Pick or type a category.'),
  content: z.string().trim().min(1, 'A prompt needs a body.'),
  tags: z.string(),
})

type PromptFormValues = z.infer<typeof promptFormSchema>

function toFormValues(prompt: Prompt | null): PromptFormValues {
  return {
    title: prompt?.title ?? '',
    description: prompt?.description ?? '',
    category: prompt?.category ?? '',
    content: prompt?.content ?? '',
    tags: prompt?.tags.join(', ') ?? '',
  }
}

interface PromptEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The prompt being edited, or null when creating a new one. */
  prompt: Prompt | null
  knownCategories: string[]
  onSubmit: (draft: PromptDraft) => void
}

export function PromptEditorDialog({
  open,
  onOpenChange,
  prompt,
  knownCategories,
  onSubmit,
}: PromptEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit prompt' : 'New prompt'}</DialogTitle>
          <DialogDescription>
            Wrap reusable slots in double braces — <code>{'{{topic}}'}</code> —
            and you can fill them in when you copy the prompt.
          </DialogDescription>
        </DialogHeader>

        {/* Keyed so switching between prompts always starts from fresh values. */}
        <PromptForm
          key={prompt?.id ?? 'new'}
          prompt={prompt}
          knownCategories={knownCategories}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface PromptFormProps {
  prompt: Prompt | null
  knownCategories: string[]
  onSubmit: (draft: PromptDraft) => void
  onClose: () => void
}

function PromptForm({
  prompt,
  knownCategories,
  onSubmit,
  onClose,
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: toFormValues(prompt),
  })

  const content = useWatch({ control, name: 'content' })
  const variables = useMemo(() => extractVariables(content ?? ''), [content])

  const categoryOptions = useMemo(() => {
    const merged = new Set<string>([...CATEGORIES, ...knownCategories])
    merged.delete(UNCATEGORIZED)
    return [...merged].sort((a, b) => a.localeCompare(b))
  }, [knownCategories])

  const submit = handleSubmit((values) => {
    onSubmit({
      title: values.title,
      description: values.description,
      content: values.content,
      category: values.category,
      tags: parseTags(values.tags),
    })
    onClose()
  })

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt-title">Title</Label>
        <Input
          id="prompt-title"
          placeholder="Rigorous code review"
          autoComplete="off"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-description">Summary</Label>
        <Input
          id="prompt-description"
          placeholder="What this prompt is good for"
          autoComplete="off"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prompt-category">Category</Label>
          <Input
            id="prompt-category"
            list="prompt-category-options"
            placeholder="Engineering"
            autoComplete="off"
            {...register('category')}
          />
          <datalist id="prompt-category-options">
            {categoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt-tags">Tags</Label>
          <Input
            id="prompt-tags"
            placeholder="code-review, quality"
            autoComplete="off"
            {...register('tags')}
          />
          <p className="text-xs text-muted-foreground">
            Comma separated. Spaces become hyphens.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-content">Prompt</Label>
        <Textarea
          id="prompt-content"
          rows={12}
          placeholder="You are reviewing a pull request in a {{language}} codebase…"
          className="font-mono text-sm leading-relaxed"
          {...register('content')}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
        {variables.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Braces className="h-3 w-3" />
            Variables detected:
            {variables.map((variable) => (
              <code
                key={variable}
                className="rounded bg-muted px-1 py-0.5 font-mono"
              >
                {variable}
              </code>
            ))}
          </p>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {prompt ? 'Save changes' : 'Add prompt'}
        </Button>
      </DialogFooter>
    </form>
  )
}
