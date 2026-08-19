# Final Report — Claude Fable 5 Capability Atlas, Prompt Library & API-Integrated DevKit

**Date:** 2026-08-19 · **Deliverable:** "Fable 5 DevKit" full-stack webapp (version `d4bf61f`) · **Repo:** `/mnt/agents/output/app` · **Artifacts:** `/mnt/agents/output/fable5-project/`

---

## 1. Executive Summary

A four-phase, gate-controlled project: (1) evidence-based capability analysis of Claude Fable 5, (2) a 272-prompt web-development library engineered from those findings and empirically evaluated, (3) a six-section modern React UI operationalizing both, (4) a secure Anthropic API integration (server-side proxy, mock-capable) with usage tracking, logging, and a modular provider architecture. Every phase passed a binary validation gate before the next began.

## 2. Final Architecture

```
┌─ React 19 + Vite 7 + Tailwind 3.4 + shadcn/ui (src/)
│   AppShell (sidebar/topbar/⌘K) ── 6 pages:
│   Dashboard · Capabilities · Recommendations · Library · Evaluation · Playground
│   Data: static bundles src/data/*.json (Phase 1/2 outputs) via typed layer src/lib/data.ts
│   API client: trpc from @/providers/trpc (same-origin /api/trpc)
├─ Hono + tRPC 11 backend (api/)
│   anthropicRouter: status | run | history | usageSummary  (zod-validated)
│   Provider abstraction (api/anthropic/providers/):
│     anthropic.ts — real Messages API call (key from server env ONLY;
│                    sends exactly model/max_tokens/messages/system/output_config.effort;
│                    never temperature/top_p/top_k/prefill/forced tool_choice — HTTP 400 on Fable 5)
│     mock.ts      — deterministic stand-in when ANTHROPIC_API_KEY unset (mock:true flag)
│     index.ts     — getProvider() env-keyed selection; future providers slot in here
│   Observability: structured metadata-only JSON logs per run (no prompt bodies, no key)
├─ MySQL via Drizzle (db/schema.ts): runs table — promptId, model, effort, maxTokens,
│   status(ok/error/refusal), tokens, costUsd, latencyMs, error, createdAt
└─ contracts/anthropic.ts — shared types: MODELS, EFFORT_LEVELS, RunInput/Result, UsageSummary
```

**Key security properties** (independently reviewed — PASS): key exists only in server `process.env`, read at one site, sent only as `x-api-key` header; never logged/persisted/returned; `.env` gitignored and never committed; no client-side key path anywhere in `src/`; model id constrained to contract enum; fixed HTTPS upstream URL + 120s timeout; parameterized DB access only.

## 3. Implemented Components (by phase)

**Phase 1 — Capability Analysis** (`phase1/`): 3-source research (21+28 searches + first-party analysis; `research/fable5_*.md`) → `capability-analysis.md` (7 sections), `capabilities.json` (15 capabilities, 14 limitations, 13 underutilized strengths, 9 inert aspects), `dev-opportunities.json` (16 prompt patterns, 10 workflows, 10 output structures, 27 design rules). **Key finding set:** Mythos-class, 1M ctx/128K out, adaptive thinking with 5-level effort dial (temperature/prefill/forced tool_choice rejected HTTP 400), SWE-bench 95.0, context rot beyond ~30–40% fill, instruction drift, prompting inversion (goal+rationale+boundaries beats step-lists).

**Phase 2 — Prompt Library** (`phase2/`): `prompt-library.json` — **272 prompts, 16 categories × 17**, strict 10-field schema, every prompt embedding Phase 1 techniques (output contracts, negative constraints, evidence-over-assertion, options-and-tradeoffs). `evaluation-methodology.md` (5-dimension rubric, stratified 30-prompt sample), 30 execution transcripts, `evaluation-results.json` (30/30 pass, mean **4.83/5**; clarity 4.57 lowest by design), `evaluation-report.md`. Improvement loop: AUTO-001 marginal→fixed→re-tested 5.00; 7 micro-fixes; independent verifier re-graded 20% (max divergence 0.8, caught one over-credit — corrected).

**Phase 3 — UI**: design-first workflow (design.md + 6 page designs) → scaffold + 3 parallel page agents. Six sections: Dashboard (metrics, benchmarks, pipeline), Capabilities (spec sheet, rejected-param chips, capability explorer, limitations w/ severity filter, do-more/do-less), Recommendations (16 copyable patterns, workflow timelines, structures, 27 DO/DON'T rules), Library (272 cards, `/`-search, category/difficulty/technique filters, URL-synced state, detail drawer, copy, playground handoff), Evaluation (4.83 gauge, verdict donut, integrity panel, sortable 30-row table), Playground (below).

**Phase 4 — Anthropic Integration**: prompt execution from UI (library deep-link `?prompt=<id>`, auto `{{variable}}` fields, ⌘↵ run, cancel), Markdown response rendering with per-block copy, three-dot loader + elapsed timer + error cards, token/cost/latency chips, session + all-time usage strips + server run log, config controls (model select, effort low→max, log-scale max-tokens 256→128K with live cost ceiling, locked-params display), secure env-based key handling with graceful mock mode, structured logging + DB run log, provider abstraction for future models.

## 4. Testing Results

| Layer | Result |
|---|---|
| Phase 1 gate (reviewer) | PASS — counts, citations, 16-claim spot-check, no forbidden-param advice |
| Phase 2 schema validation | 272/272 valid, 0 errors, 0 near-dupes, all technique IDs resolvable |
| Phase 2 evaluation | 30/30 pass, mean 4.83; executions tool-verified (Vitest, pytest, npm, tsc, live HTTP) |
| Phase 2 scoring integrity | 6-sample re-grade, max divergence 0.8, no batch re-grade |
| Phase 3 build gate | `tsc -b` clean, `vite build` exit 0 (frontend 1.9MB/590KB-gzip chunk + server boot.js) |
| Phase 3 browser gate | All 6 pages render with real data; library filters/deep-links work; playground executed a full run via UI (mock): tokens/cost/latency/history all updated |
| Phase 4 API smoke tests | `status`, `run` (mock), `history`, `usageSummary` verified over HTTP incl. DB persistence; invalid model id rejected post-fix |
| Phase 4 security review | PASS — no key exposure/injection; 1 minor finding fixed (model enum); 1 documented limitation (no rate limit) |

## 5. Known Limitations

1. **No live key in this environment** — real-API path is code-reviewed and contract-tested but validated end-to-end only in mock mode; first live run should be verified with a real `ANTHROPIC_API_KEY` in `.env`.
2. **No auth/rate limiting** on the `run` mutation — fine for trusted-single-user preview; must add gateway auth/quota before public exposure (security review's major conditional finding).
3. **Non-streaming responses** — backend returns whole responses; UI uses loader-then-render (design-sanctioned degradation).
4. **Refusal runs record null usage** — cost totals slightly undercount on refusals.
5. **Evaluation graded by the model itself** (self-execution), mitigated by 20% independent verification; 89% of prompts untested individually (uniform authoring rules + schema validation as compensating controls).
6. **Single 1.9MB JS chunk** (272 prompts inlined) — code-splitting opportunity.
7. Some prompts' acceptance criteria assume a tool-enabled executor; chat-only use degrades gracefully but less verifiably.

## 6. Recommendations for Further Development

1. Set `ANTHROPIC_API_KEY` server-side and run a 10-prompt live smoke suite; compare live outputs against mock-mode UX assumptions.
2. Add streaming (SSE) to the `run` endpoint + Playground; add per-key rate limiting and optional Kimi auth before publishing publicly.
3. Expand evaluation to the full 272 (batch API, 50% cost) with cached shared fixtures; add regression re-runs on any prompt edit.
4. Code-split library data per category; add prompt-version diffing and user ratings closing the loop into `evaluation-results.json`.
5. Extend the provider interface to additional models (the `MODELS` contract + `getProvider()` already support this); add prompt-caching pre-warm for repeated large contexts (Phase 1 finding: 512-token minimum, 0.1× reads).
6. Export/report generation (docx/pdf) for the capability analysis and evaluation report from the UI.

---

*Artifacts: `phase1/capability-analysis.md`, `phase1/capabilities.json`, `phase1/dev-opportunities.json`, `phase2/prompt-library.json`, `phase2/evaluation-methodology.md`, `phase2/evaluation-report.md`, `phase2/evaluation-results.json`, `phase2/eval/` (30 transcripts + results + verification), webapp version `d4bf61f`.*
