import type { Prompt } from '@/types/prompt'

/**
 * Prompts the library ships with on first run. Dates are fixed so a fresh
 * install always sorts the same way.
 */
export const SEED_PROMPTS: Prompt[] = [
  {
    id: 'seed-code-review',
    title: 'Rigorous code review',
    description:
      'Reviews a diff for correctness bugs first, style second, with severity labels.',
    content: `You are reviewing a pull request in a {{language}} codebase.

Review the diff below and report findings in this order:
1. Correctness bugs — anything that produces a wrong result, crashes, or breaks an existing caller.
2. Security and data-handling issues.
3. Simplifications — duplicated logic, dead code, or an existing helper that already does this.
4. Style nits — only if they violate the surrounding code's conventions.

For each finding give: file and line, a one-sentence statement of the defect, and a concrete failure scenario (inputs -> wrong output). Skip anything you cannot demonstrate. If a category is clean, say so in one line rather than padding it.

Diff:
{{diff}}`,
    category: 'Engineering',
    tags: ['code-review', 'quality', 'engineering'],
    favorite: true,
    copyCount: 12,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-05-02T14:30:00.000Z',
  },
  {
    id: 'seed-bug-repro',
    title: 'Minimal bug reproduction',
    description:
      'Turns a vague bug report into a minimal, deterministic reproduction.',
    content: `I have a bug I cannot reliably reproduce.

Observed behaviour: {{observed}}
Expected behaviour: {{expected}}
Environment: {{environment}}

Do this:
1. List the smallest set of conditions that could produce the observed behaviour.
2. Rank them by likelihood, with the reasoning for each rank.
3. For the top candidate, write a minimal reproduction script or test case.
4. Tell me exactly what output would confirm or rule out that candidate.

Do not propose a fix until the reproduction is confirmed.`,
    category: 'Engineering',
    tags: ['debugging', 'engineering', 'testing'],
    favorite: false,
    copyCount: 5,
    createdAt: '2026-01-20T11:15:00.000Z',
    updatedAt: '2026-04-18T08:05:00.000Z',
  },
  {
    id: 'seed-editor',
    title: 'Ruthless prose editor',
    description:
      'Tightens writing without flattening the voice — returns a diff-style rationale.',
    content: `Edit the passage below for clarity and economy. Keep the author's voice; do not make it sound generic.

Rules:
- Cut hedges, filler, and throat-clearing openers.
- Break any sentence carrying more than one idea.
- Replace abstractions with the concrete thing they stand for.
- Preserve technical precision. Never trade accuracy for smoothness.
- Target length: {{target_length}}.

Return two sections: the edited passage, then a short list of the most consequential changes and why each one helps.

Passage:
{{passage}}`,
    category: 'Writing',
    tags: ['editing', 'writing', 'clarity'],
    favorite: true,
    copyCount: 21,
    createdAt: '2025-11-04T16:40:00.000Z',
    updatedAt: '2026-06-11T10:12:00.000Z',
  },
  {
    id: 'seed-explain-level',
    title: 'Explain at three depths',
    description:
      'Explains a concept three times — intuition, working model, and precise definition.',
    content: `Explain {{concept}} three times, each building on the last:

1. **Intuition** (~100 words): the core idea via one concrete analogy. No jargon.
2. **Working model** (~250 words): how it actually behaves, including the one thing beginners most often get wrong.
3. **Precise account**: the formal definition, its assumptions, and where the analogy from step 1 breaks down.

End with two questions I should be able to answer if I understood it, and the answers.`,
    category: 'Research',
    tags: ['learning', 'explanation', 'teaching'],
    favorite: false,
    copyCount: 9,
    createdAt: '2025-12-02T13:25:00.000Z',
    updatedAt: '2026-03-09T09:45:00.000Z',
  },
  {
    id: 'seed-assumption-audit',
    title: 'Assumption audit',
    description:
      'Surfaces the silent assumptions in a plan and ranks them by blast radius.',
    content: `Here is a plan I am about to commit to:

{{plan}}

Before I start, audit it:
1. List every assumption the plan depends on but does not state.
2. For each, mark it Load-bearing (plan fails if false), Costly (plan survives but gets expensive), or Cosmetic.
3. For every load-bearing assumption, give the cheapest test that would falsify it before I invest in the plan.
4. Name the single assumption that, if wrong, wastes the most work — and what I should do about it today.

Be specific to this plan. Do not give me a generic risk checklist.`,
    category: 'Analysis',
    tags: ['planning', 'critical-thinking', 'risk'],
    favorite: true,
    copyCount: 17,
    createdAt: '2026-02-14T07:30:00.000Z',
    updatedAt: '2026-07-01T15:20:00.000Z',
  },
  {
    id: 'seed-steelman',
    title: 'Steelman then rebut',
    description:
      'Builds the strongest version of an opposing view before arguing against it.',
    content: `Position I hold: {{position}}

Step 1 — Steelman: state the strongest case against my position. Use the best available evidence and the most charitable framing. Do not strawman it, and do not hedge it into agreement with me.

Step 2 — Rebut: respond to that steelman on its own terms. Where it is right, concede plainly.

Step 3 — Verdict: after the exchange, what should I actually believe, and at what confidence? Name the evidence that would move you most.`,
    category: 'Analysis',
    tags: ['critical-thinking', 'argument', 'reasoning'],
    favorite: false,
    copyCount: 6,
    createdAt: '2026-03-01T18:00:00.000Z',
    updatedAt: '2026-05-27T12:00:00.000Z',
  },
  {
    id: 'seed-prd',
    title: 'One-page product spec',
    description:
      'Drafts a tight PRD: problem, user, scope boundary, and success metric.',
    content: `Draft a one-page spec for: {{feature}}

Sections, in this order and no others:
- **Problem** — the user's situation today and what it costs them. No solution language.
- **Who it is for** — the specific segment, and who it is explicitly not for.
- **What we are building** — the smallest version that solves the problem.
- **Out of scope** — three things a reader would assume are included but are not.
- **Success** — one primary metric with a target and a time window, plus one guardrail metric that must not regress.
- **Open questions** — the decisions still unmade, each with the person or data that would settle it.

Keep the whole thing under 500 words. Prefer specifics over adjectives.`,
    category: 'Product',
    tags: ['product', 'spec', 'planning'],
    favorite: false,
    copyCount: 14,
    createdAt: '2025-10-19T09:10:00.000Z',
    updatedAt: '2026-06-22T11:40:00.000Z',
  },
  {
    id: 'seed-data-sanity',
    title: 'Dataset sanity check',
    description:
      'Interrogates a dataset for the flaws that quietly invalidate analysis.',
    content: `I am about to analyse this dataset: {{dataset_description}}

Before any modelling, tell me what could quietly invalidate the results:
1. Selection effects — who or what is missing from this data, and which direction does that bias the conclusion?
2. Measurement — what does each key column actually record, versus what its name implies?
3. Time — are the rows comparable across the whole period, or did a definition, instrument, or process change mid-stream?
4. Leakage — anything that encodes the outcome I am trying to predict.
5. Aggregation — where a group-level pattern could reverse at the individual level.

For each, give the specific check I should run and the result that would worry me.`,
    category: 'Analysis',
    tags: ['data', 'analysis', 'statistics'],
    favorite: false,
    copyCount: 8,
    createdAt: '2026-01-05T14:55:00.000Z',
    updatedAt: '2026-04-30T16:10:00.000Z',
  },
  {
    id: 'seed-launch-email',
    title: 'Launch announcement email',
    description:
      'Writes a short launch email that leads with the user benefit, not the feature.',
    content: `Write a launch email for {{product}} announcing {{feature}}.

Audience: {{audience}}
Tone: direct, warm, zero hype. No exclamation marks.

Structure:
- Subject line: under 50 characters, states the benefit.
- First sentence: the problem the reader already has.
- Two short paragraphs: what changed and what it lets them do now. One concrete example with real numbers or a real scenario.
- One call to action, one link.

Under 150 words total. Cut every sentence that would survive being deleted.`,
    category: 'Marketing',
    tags: ['email', 'marketing', 'copywriting'],
    favorite: false,
    copyCount: 4,
    createdAt: '2026-02-27T10:20:00.000Z',
    updatedAt: '2026-05-14T13:35:00.000Z',
  },
  {
    id: 'seed-weekly-review',
    title: 'Weekly review partner',
    description:
      'A structured end-of-week review that separates output from momentum.',
    content: `Run my weekly review. Here is what happened:

{{week_notes}}

Ask me about anything ambiguous before summarising. Then give me:
1. **Shipped** — what actually reached someone else this week.
2. **Moved** — work that advanced but is not done, with its true remaining blocker.
3. **Stalled** — anything that has not moved in two weeks. Say plainly whether to kill it, shrink it, or schedule it.
4. **Next week** — at most three commitments, each with the first concrete action.

Be honest about drift. Do not congratulate me on activity that produced nothing.`,
    category: 'Personal',
    tags: ['productivity', 'review', 'personal'],
    favorite: false,
    copyCount: 3,
    createdAt: '2025-12-15T08:00:00.000Z',
    updatedAt: '2026-07-08T07:50:00.000Z',
  },
]
