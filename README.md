# Prompt Library

A local-first library for storing, searching, and reusing your best prompts.
Everything lives in your browser — no account, no server, no database.

Built with React 19, TypeScript, Vite, Tailwind CSS v3, and shadcn/ui primitives
on Radix.

## Features

- **Browse and search** — full-text search across titles, summaries, prompt
  bodies, categories, and tags. Every search term must match (AND), so adding
  words narrows rather than widens.
- **Filter and sort** — filter by category, by any combination of tags, or by
  favorites; sort by recently updated, oldest, title, or most copied.
- **Create, edit, duplicate, delete** — with validation and a confirmation step
  before anything is removed.
- **Variables** — wrap a reusable slot in double braces (`{{topic}}`). The
  detail view lists every variable it finds, lets you fill them in, and shows a
  live preview. Copying takes the filled-in version; unfilled slots stay as
  placeholders so nothing silently disappears.
- **Copy tracking** — each copy bumps a counter, which feeds the "most copied"
  sort so your workhorse prompts surface on their own.
- **Import / export** — export the whole library as JSON, import it back on
  another machine. Import merges by `id`: same id replaces, new id is added.
- **Light / dark / system theme**, persisted across sessions.
- **⌘K / Ctrl+K** focuses the search box.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

The library is seeded with ten prompts on first run. Everything you change after
that is written to `localStorage` under `prompt-library.prompts.v1`.

## Scripts

| Script            | What it does                                 |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                     |
| `npm run build`   | Type-agnostic production build into `dist/`  |
| `npm run check`   | TypeScript project build (`tsc -b`), no emit |
| `npm run lint`    | ESLint (flat config)                         |
| `npm test`        | Vitest unit tests                            |
| `npm run format`  | Prettier over the repo                       |
| `npm run preview` | Serve the production build locally           |

## Project structure

```
src/
  components/ui/     shadcn/ui primitives (button, card, dialog, select, …)
  components/        theme provider and mode toggle
  sections/          page sections — header, filter sidebar, card, dialogs
  hooks/             usePrompts (state + persistence), useCopyToClipboard
  lib/               prompt-utils (search, sort, variables), storage, cn
  data/              seed prompts shipped on first run
  types/             Prompt, filters, sort options
  App.tsx            composes the sections and owns filter state
  main.tsx           entry point
```

## Data model

```ts
interface Prompt {
  id: string
  title: string
  description: string
  content: string // may contain {{variables}}
  category: string
  tags: string[]
  favorite: boolean
  copyCount: number
  createdAt: string // ISO-8601
  updatedAt: string // ISO-8601
}
```

Anything read from `localStorage` or an imported file goes through
`coercePrompt`, which fills in missing fields and drops unusable records — a
corrupt payload falls back to the seed library rather than leaving you with an
empty screen.

## Storage notes

Prompts are scoped to one browser profile on one machine. Clearing site data
clears the library, so use **Export** before you do. The export file is plain
JSON (`{ "version": 1, "prompts": [...] }`), and import also accepts a bare
array of prompts.

## Tests

`npm test` covers the logic worth pinning down: variable extraction and
substitution, tag parsing, the AND-semantics of search, every sort order,
tag facet counts, and the storage layer's coercion, round-tripping, and merge
behaviour.
