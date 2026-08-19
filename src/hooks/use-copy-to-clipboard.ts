import { useCallback, useEffect, useRef, useState } from 'react'

/** Copies text to the clipboard, with a textarea fallback for insecure origins. */
async function writeText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the legacy path below.
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function useCopyToClipboard(resetAfterMs = 1600) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string, id = 'default') => {
      const ok = await writeText(text)
      if (!ok) return false
      setCopiedId(id)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopiedId(null), resetAfterMs)
      return true
    },
    [resetAfterMs],
  )

  return { copy, copiedId }
}
