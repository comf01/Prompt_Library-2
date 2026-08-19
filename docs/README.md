# Project documents

Reference reports imported from the **Fable 5 DevKit** project (2026-08-19), a
four-phase effort whose Phase 2 produced a 272-prompt web-development library.
They are kept verbatim as background and design reference for this app.

| File | What it is |
| --- | --- |
| [`fable5-capability-analysis.md`](./fable5-capability-analysis.md) | Phase 1 — capability & limitation analysis of `claude-fable-5`; source of the prompt-design rules (output contracts, negative constraints, evidence-over-assertion, goal+rationale+boundaries). |
| [`prompt-library-evaluation-report.md`](./prompt-library-evaluation-report.md) | Phase 2 — evaluation of the DevKit's **272-prompt library**: 30-prompt stratified sample, 30/30 pass, mean 4.83/5. |
| [`fable5-devkit-final-report.md`](./fable5-devkit-final-report.md) | Final report of the full DevKit webapp (6-page UI, tRPC/Hono backend, MySQL, Anthropic API integration). |

## Scope notes

- **The evaluation report grades the DevKit's 272-prompt library, not the seed
  prompts shipped with this app.** This repository currently contains a
  local-first prompt library SPA with 10 seed prompts.
- The reports reference data artifacts that are **not in this repository**:
  `prompt-library.json` (the 272 prompts), `capabilities.json`,
  `dev-opportunities.json`, the `research/` files, and the 30 evaluation
  transcripts. Importing the 272 prompts into this app requires
  `prompt-library.json`; the app's JSON import accepts records that carry at
  least a `title` or `content` field (see `src/lib/storage.ts`).
- The final report describes a different architecture (server, database, API
  proxy) than this app, which is deliberately client-only with `localStorage`
  persistence.
