# Prompt Library Evaluation Report

**Date:** 2026-08-19 · **Library:** 272 prompts, 16 categories (`prompt-library.json`) · **Sample:** 30 prompts (11%, stratified across all categories/difficulties) · **Methodology:** `evaluation-methodology.md`

## 1. Executive Summary

The library passed evaluation decisively: **30/30 sampled prompts score "pass"** (final verdicts after the improvement loop), overall mean **4.83/5.0**. One prompt (AUTO-001) initially graded *marginal* and was revised and re-tested to a perfect score. An independent verifier re-graded 20% of the sample (max divergence 0.8, below the 1.0 re-grade threshold) and caught one over-credited score (WF-010, corrected 5.00→4.20, still pass).

## 2. Aggregate Results

| Metric | Value |
|---|---|
| Prompts tested | 30 (all 16 categories represented) |
| Pass / Marginal / Weak | **30 / 0 / 0** (post-fix) |
| Overall mean score | **4.83 / 5.0** |
| Clarity | 4.57 |
| Contract Adherence | 4.87 |
| Actionability | 4.90 |
| Fable-5 Alignment | 4.90 |
| Usefulness | 4.90 |
| Scoring integrity check | 6 re-graded, max divergence 0.8, no batch re-grade |

Category means: Code Review 5.0 · Databases 5.0 · Security 5.0 · Architecture 4.9 · Automation 4.9 · Backend 4.9 · Full-Stack 4.9 · APIs 4.8 · Debugging 4.8 · Frontend 4.8 · Performance 4.8 · Testing 4.8 · UI/UX 4.8 · DevOps 4.7 · Refactoring 4.6 · Dev Workflows 4.5.

## 3. Test Execution Highlights (authentic, tool-verified runs)

- **TEST-001**: acceptance gate executed for real (Vitest 4.1.11) — the generated suite caught the fixture's planted rounding bug; `it.fails` conversion produced a genuine 38-passed/1-expected-fail summary.
- **AUTO-010**: migration scripts written and run for real (Next 14→15), `tsc --noEmit` clean, idempotency re-runs zero-change.
- **BE-001**: generated Express route file smoke-tested live — 6/6 acceptance checks passed.
- **DBG-010**: flaky-test fixture reproduced in a real pytest sandbox; fix went 50/50 green.
- **AUTO-001 (post-fix)**: sandbox-executed — refuses `..` traversal (both trailing and mid-path) with parent tree verified byte-identical.
- **SEC-001/REV-001/REV-010**: all planted defects found with quoted evidence; red herrings correctly not flagged; no severity inflation.

## 4. Weak-Pattern Analysis & Fixes Applied

| Pattern observed | Instances | Root cause | Fix |
|---|---|---|---|
| Self-contradictory boundary clause | AUTO-001 (marginal, contractAdherence 3) | "paths containing '..' after resolution" — resolution eliminates '..' | Reworded as observable raw-argument behavior + 4th acceptance criterion; re-tested → **5.00 pass** |
| Placeholder defects (overlapping, nested, malformed) | OPS-001, TEST-001, WF-001 | Template authoring slips | Consolidated/replaced; contract items split |
| Garbled placeholder splice + incorrect embedded guidance | OPS-010 | Long fills broke grammar; CIDR 172.16/12 logic wrong | Re-spliced; corrected CIDR guidance |
| Acceptance criteria assume execution environment w/o fallback | REF-001, PERF-001, WF-010, DBG-010 | "paste verbatim test output" with no chat-only path | Documented as known limitation; methodology rule added: fixtures must match executor capabilities |
| Contract/goal micro-mismatches (internal tension) | FS-001, FE-010, UIX-001, API-001 | Deliverable list vs. boundary promises drift | UIX-001 gate made consistent; others documented |
| Missing input-context slots | FE-001, REF-010 | Filenames referenced without paste instruction | Explicit paste requirement / new `{{current_wiring_or_code_context}}` slot |
| Over-credited "honest degradation" | WF-010 | Grader misread fabricated observations as honest | Score corrected by verifier (5.00→4.20) |

**Dominant strength pattern:** goal+rationale+boundaries framing, explicit output contracts, negative constraints, and evidence-over-assertion consistently produced zero-rework, contract-conformant responses — empirically confirming the Phase 1 design rules.
**Dominant weakness:** Clarity (4.57) — nearly all deductions traced to placeholder/contract micro-defects, now fixed or documented.

## 5. Conclusions

1. The 272-prompt library is **validated for use**: 11% stratified sample, 100% pass rate post-fix, mean 4.83/5.
2. The Phase 1 Fable-5 design rules transfer into measurably effective prompts — Fable-5 Alignment 4.90 confirms the patterns (output contracts, negative constraints, evidence-over-assertion, options-and-tradeoffs) work as theorized.
3. Remaining risks: untested 89% of the library (mitigated by uniform authoring rules + schema validation); single-turn, self-execution grading bias (mitigated by 20% independent verification); execution-environment-dependent acceptance criteria (documented).
4. Recommendation: expose per-prompt evaluation metadata in the UI (Phase 3) and re-run sampling after any bulk edits.
