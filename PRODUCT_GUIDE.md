# Review Lens Product Guide

## Product Definition

Review Lens is a cognitive semantic code review GUI for the AI-generated code era.

It is not a generic review management tool. It is not a ticket triage board, approval tracker, or comment inbox. Review Lens exists to help engineers inspect code changes by meaning, system behavior, risk, and evidence when the volume and shape of AI-generated code make line-by-line review insufficient.

Review Lens treats a pull request or patch as a semantic object:

- What behavior changed.
- Which invariants may no longer hold.
- Which contracts are affected.
- Which dependencies and packages are touched.
- Which failure modes became more likely.
- Which questions a human reviewer must answer before trusting the change.

## Product Promise

Review Lens turns code review from raw diff reading into structured semantic inspection.

The product helps a reviewer move between:

- A risk-ranked list of changed concerns.
- Lens-specific maps of code meaning and impact.
- Evidence cards that explain why a change deserves attention.
- Raw diff anchors for source-level verification.
- AI review prompts that preserve the reviewer's intent and skepticism.

The interface should feel like an engineering instrument: dense, calm, inspectable, and built for repeated expert use.

## Why This Exists

AI can generate large patches quickly. Those patches may compile, pass narrow tests, and look locally plausible while still changing product behavior, security boundaries, architectural assumptions, API contracts, or operational failure modes.

Traditional code review UI is optimized around files and lines. Review Lens is optimized around cognitive review questions:

- What did the code start meaning?
- What did it stop guaranteeing?
- Where did risk concentrate?
- What evidence supports that concern?
- What should a reviewer ask the AI or author next?

## Core Users

### Staff Engineer Or Tech Lead

The senior reviewer who needs to understand whether an AI-assisted change is safe to merge.

Goals:

- Identify semantic risk quickly.
- See changed behavior across files and packages.
- Check contracts, invariants, and architecture boundaries.
- Decide where raw diff inspection matters most.

Pain points:

- AI-generated patches can be wide and superficially coherent.
- The most dangerous change is often not the largest file diff.
- Reviewing every line equally wastes attention.

### Security Or Reliability Reviewer

The specialist reviewer focused on trust boundaries, abuse cases, data exposure, failures, and rollback safety.

Goals:

- Find changed authorization, validation, and data-flow assumptions.
- Identify new failure modes.
- Connect findings to concrete evidence.
- Ask precise blocking questions.

Pain points:

- Security and reliability risks are scattered across call paths.
- Passing tests do not prove changed behavior is safe.
- Raw diffs hide trust-boundary movement.

### AI-Assisted Developer

The engineer using an AI coding assistant and preparing a change for human review.

Goals:

- Understand what the generated patch changed semantically.
- Preflight likely review objections.
- Produce a review prompt or summary that invites useful scrutiny.
- Tighten tests, contracts, and explanations before handoff.

Pain points:

- The assistant may introduce behavior the developer did not intend.
- Generated explanations may sound confident but miss hidden coupling.
- The developer needs help becoming a better reviewer of generated code.

## Review Object

The primary object in Review Lens is a code change set, usually a pull request, branch diff, patch, or local working tree delta.

Each review object can include:

- Repository and branch context.
- Changed files and packages.
- Semantic findings.
- Risk score.
- Lens-specific evidence.
- Raw diff anchors.
- Reviewer questions.
- AI review prompt material.

The product should avoid generic workflow fields unless they directly support code review judgment.

## Core Lenses

### Overview

Summarizes review risk, changed areas, highest-risk findings, and what the reviewer should inspect first.

### Semantic Diff

Compares meaning rather than lines. It should eventually detect behavior changes, invariant shifts, renamed concepts, changed control flow, and altered data assumptions.

### Security

Focuses on authorization, authentication, input validation, data exposure, secrets, trust boundaries, and unsafe defaults.

### Architecture

Shows module boundaries, ownership, coupling, dependency direction, domain leakage, and architectural drift.

### API Contract

Tracks changes to request and response shape, schemas, status codes, events, public methods, backward compatibility, and caller expectations.

### Dependencies

Surfaces dependency additions, removals, version movement, transitive exposure, runtime footprint, and supply-chain risk.

### Failures

Examines error paths, retries, fallbacks, observability, tests, migrations, rollback behavior, and operational failure modes.

### Packages

Maps changed packages, workspaces, generated artifacts, release boundaries, and package ownership.

### Classic Diff

Keeps raw line-oriented inspection available. Classic diff is a verification layer, not the product's main mental model.

### AI Review Prompt

Builds a structured prompt for an AI reviewer using the current semantic findings, evidence, open questions, and review policy.

## MVP Scope

The first product version should establish the review frame before real Git analysis is implemented.

### In Scope

- A top-level review shell for a selected repository.
- The required lens tabs.
- A three-pane layout: change list, graph or map, detail card.
- Mock risk-ranked semantic findings.
- Lens-specific placeholder maps and summaries.
- Evidence and reviewer-question detail cards.
- Raw diff placeholder links.
- AI review prompt placeholder content.
- Tests that protect the required product structure.

### Out Of Scope For MVP

- Real Git parsing.
- Pull request import.
- AST or language-server analysis.
- AI-generated findings.
- Authentication.
- Multi-user review workflow.
- Persistent storage.
- Generic review assignment or approval tracking.

## Primary Workflow

### Inspect A Generated Patch

1. Reviewer opens a repository or patch.
2. Review Lens shows a risk score and risk-ranked findings.
3. Reviewer chooses a lens based on the kind of concern.
4. The center pane shows a semantic map for that lens.
5. The detail pane explains evidence, reviewer questions, and raw diff anchors.
6. Reviewer uses the AI Review Prompt lens to ask targeted follow-up questions.
7. Reviewer verifies critical findings in Classic Diff before merge.

Success criteria:

- The reviewer can identify the first three areas worth human attention.
- Each high-risk finding has evidence and a concrete review question.
- The UI never implies that AI confidence replaces human verification.

## Finding Severity

- `Blocker`: A semantic or safety concern that should prevent merge until answered or fixed.
- `High`: A meaningful behavior, contract, security, or failure-mode risk.
- `Medium`: A review concern that likely needs explanation, tests, or scoped inspection.
- `Low`: A small concern, cleanup risk, or weak signal.
- `Note`: Context that helps review but is not itself a risk.

## UX Principles

- Optimize for reviewer attention, not task management.
- Put risk-ranked semantic findings before file lists.
- Keep raw diff access one click away from every finding.
- Distinguish evidence from speculation.
- Show reviewer questions in concrete engineering language.
- Treat AI output as review support, not authority.
- Make dense information scannable without turning the UI into a dashboard full of decorative cards.
- Keep the interface calm, compact, and source-verifiable.

## Information Architecture

### Header

Shows:

- Product name.
- Repository selector mock.
- Review risk score.
- Current review target.

### Lens Tabs

Shows the required top-level lenses:

- Overview.
- Semantic Diff.
- Security.
- Architecture.
- API Contract.
- Dependencies.
- Failures.
- Packages.
- Classic Diff.
- AI Review Prompt.

### Change List Pane

Shows risk-ranked semantic findings:

- Severity.
- Finding title.
- Lens.
- Affected concept, package, or file area.

This pane is not a generic task list.

### Graph / Map Pane

Shows a lens-specific visualization placeholder:

- Semantic flow.
- Trust boundary.
- Dependency relationship.
- Package impact.
- Failure path.
- Prompt context.

This pane should help the reviewer reason about meaning before reading raw lines.

### Detail Card Pane

Shows the selected finding:

- Severity.
- Finding title.
- Evidence.
- Reviewer question.
- Raw diff link.

The detail card should make the next human review action obvious.

## Suggested Future Data Model

### Review Target

- `id`
- `repository`
- `base_ref`
- `head_ref`
- `provider`
- `created_at`
- `updated_at`

### Semantic Finding

- `id`
- `review_target_id`
- `lens`
- `severity`
- `title`
- `summary`
- `evidence`
- `reviewer_question`
- `raw_diff_anchor`
- `affected_files`
- `affected_packages`

### Lens Map

- `id`
- `review_target_id`
- `lens`
- `nodes`
- `edges`
- `summary`

### AI Review Prompt

- `id`
- `review_target_id`
- `prompt`
- `included_findings`
- `review_policy`
- `created_at`

## Metrics

Early product metrics should measure review usefulness rather than generic throughput:

- Number of high-risk findings inspected.
- Percentage of findings with raw diff anchors.
- Percentage of high-risk findings with reviewer questions.
- Time to first meaningful review question.
- Number of generated-code risks caught before merge.
- Reviewer edits to AI-generated prompts.

## Future Directions

- GitHub pull request import.
- Local working-tree diff ingestion.
- AST-backed semantic diff.
- Dependency graph extraction.
- Package and workspace ownership maps.
- AI-assisted finding generation with evidence requirements.
- Prompt export for external AI reviewers.
- Policy-aware review lenses per repository.
- Classic diff anchors linked to semantic findings.

## Open Product Questions

- Which language ecosystem should receive semantic analysis first?
- Should findings be generated locally, remotely, or both?
- What evidence standard is required before a finding can be labeled `High` or `Blocker`?
- How should Review Lens show uncertainty without hiding risk?
- Which AI review prompts should be built in as defaults?
- What is the minimum useful raw diff anchor format?
