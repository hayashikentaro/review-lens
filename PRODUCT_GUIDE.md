# Review Lens Product Guide

## Overview

Review Lens helps teams turn scattered product, code, and content feedback into clear review decisions. It is a workspace for collecting review evidence, identifying recurring issues, and deciding what needs action now, what can wait, and what should be closed.

The product is built for people who need to review complex work without losing context: product managers, engineering leads, designers, QA reviewers, and content editors.

## Product Promise

Review Lens gives every review a shared lens:

- What changed.
- What reviewers noticed.
- Which issues matter.
- Who owns the next action.
- Whether the work is ready to move forward.

The experience should feel calm, structured, and fast. Reviewers should spend less time reconstructing context and more time making useful judgments.

## Core Users

### Review Owner

The person responsible for driving a review to completion.

Goals:

- Create a review with enough context for others to contribute.
- Gather feedback from multiple sources.
- Prioritize feedback into actionable decisions.
- Track unresolved risks before approval.

Pain points:

- Feedback is split across comments, docs, tickets, chat, and meetings.
- Important concerns get buried under minor notes.
- It is unclear when a review is truly done.

### Reviewer

The person giving feedback on submitted work.

Goals:

- Understand the review scope quickly.
- Leave precise, useful feedback.
- See whether their feedback was addressed.
- Avoid repeating concerns already raised by others.

Pain points:

- Review context is incomplete.
- Existing feedback is hard to scan.
- There is no shared severity or decision framework.

### Stakeholder

The person who needs confidence in the outcome but may not contribute detailed feedback.

Goals:

- See current review status at a glance.
- Understand open risks and blockers.
- Know whether approval is meaningful.

Pain points:

- Status summaries are vague.
- Risks are not separated from low-priority feedback.
- Decisions are hard to audit later.

## Key Concepts

### Review

A bounded review of a specific work item, such as a feature, design, release candidate, document, pull request, or policy.

Each review includes:

- Title.
- Summary.
- Scope.
- Source links.
- Participants.
- Review status.
- Feedback items.
- Final decision.

### Lens

A structured perspective used to evaluate feedback. Lenses help teams review with consistency.

Example lenses:

- Product quality.
- User experience.
- Technical risk.
- Compliance.
- Accessibility.
- Release readiness.

### Feedback Item

A single review observation, concern, suggestion, or question.

Each item includes:

- Description.
- Source.
- Author.
- Lens.
- Severity.
- Status.
- Owner.
- Resolution note.

### Decision

The final review outcome.

Possible decisions:

- Approved.
- Approved with follow-up.
- Changes requested.
- Blocked.
- Closed without action.

## MVP Scope

The first version should focus on creating reviews, collecting feedback, classifying feedback, and producing a clear decision summary.

### In Scope

- Create, edit, and archive reviews.
- Add source links to each review.
- Add feedback items manually.
- Assign each feedback item to a lens.
- Set severity: blocker, high, medium, low, note.
- Set item status: open, in progress, resolved, deferred, closed.
- Assign owners to feedback items.
- View review status by severity and item status.
- Generate a review summary from current feedback.
- Record a final decision and resolution notes.

### Out of Scope For MVP

- Automated imports from GitHub, Linear, Slack, Figma, or docs.
- AI-generated feedback.
- Real-time collaborative editing.
- Custom workflow automation.
- Organization-wide analytics.
- Fine-grained permission controls.

These can come later once the core review workflow feels reliable.

## Primary Workflows

### Create A Review

1. Review owner creates a review.
2. Owner adds a concise summary and defines scope.
3. Owner attaches relevant source links.
4. Owner invites or names reviewers.
5. Review starts in `Draft` or `Open` status.

Success criteria:

- A reviewer can understand what is being reviewed in under one minute.
- The review scope makes clear what feedback is welcome.

### Add Feedback

1. Reviewer opens a review.
2. Reviewer scans existing feedback grouped by lens or severity.
3. Reviewer adds a feedback item.
4. Reviewer selects lens, severity, and optional source.
5. Item starts as `Open`.

Success criteria:

- Feedback can be added without ceremony.
- Important concerns are easy to distinguish from notes.

### Triage Feedback

1. Review owner reviews open feedback.
2. Owner assigns owners and updates statuses.
3. Owner marks low-value items as deferred or closed with a note.
4. Owner keeps blockers and high-severity issues visible.

Success criteria:

- The current risk profile is obvious.
- Every unresolved important item has an owner.

### Decide Review Outcome

1. Review owner checks unresolved blockers and high-severity items.
2. Owner writes a short decision note.
3. Owner selects the final decision.
4. Review moves to a completed state.

Success criteria:

- The decision explains why the work can or cannot proceed.
- Future readers can audit what was considered.

## Review Statuses

- `Draft`: Review is being prepared.
- `Open`: Reviewers can add feedback.
- `Triage`: Feedback is being sorted and assigned.
- `Ready for decision`: No known blockers remain, or remaining risks are accepted.
- `Completed`: Final decision is recorded.
- `Archived`: Review is retained but no longer active.

## Feedback Severity

- `Blocker`: Must be resolved before approval.
- `High`: Important issue that meaningfully affects quality, safety, or delivery.
- `Medium`: Should be addressed if practical.
- `Low`: Minor improvement or cleanup.
- `Note`: Observation, praise, question, or context that may not require action.

## UX Principles

- Prioritize scanability over decoration.
- Keep the review decision visible from every review detail view.
- Separate blockers from ordinary feedback.
- Make ownership and status obvious.
- Let users collapse low-priority noise.
- Avoid forcing every note into an action item.
- Preserve context for future audits.

## Information Architecture

### Review List

Shows active reviews with:

- Title.
- Status.
- Decision, if completed.
- Open blockers.
- Open high-severity items.
- Last updated time.
- Owner.

### Review Detail

Shows:

- Review summary and scope.
- Source links.
- Participants.
- Status and decision controls.
- Feedback grouped by lens, severity, owner, or status.
- Decision summary.

### Feedback Detail

Shows:

- Full feedback text.
- Source and author.
- Lens.
- Severity.
- Status.
- Owner.
- Resolution note.
- Activity history.

## Suggested Data Model

### Review

- `id`
- `title`
- `summary`
- `scope`
- `status`
- `decision`
- `decision_note`
- `owner_id`
- `created_at`
- `updated_at`
- `completed_at`

### Review Source

- `id`
- `review_id`
- `label`
- `url`
- `source_type`

### Review Participant

- `id`
- `review_id`
- `user_id`
- `role`

### Feedback Item

- `id`
- `review_id`
- `body`
- `source_id`
- `author_id`
- `lens`
- `severity`
- `status`
- `owner_id`
- `resolution_note`
- `created_at`
- `updated_at`
- `resolved_at`

### Activity Event

- `id`
- `review_id`
- `feedback_item_id`
- `actor_id`
- `event_type`
- `event_payload`
- `created_at`

## MVP Screens

- Review list.
- Create review.
- Review detail.
- Add feedback.
- Feedback item drawer or detail panel.
- Decision modal.

## Empty States

### No Reviews

Invite the user to create the first review. Emphasize that a review can start with only a title, summary, and source link.

### No Feedback

Show that the review is ready for comments. Provide a clear add-feedback action.

### No Open Blockers

Signal that no blocker feedback is currently open, while still showing unresolved high and medium items.

## Metrics

Early product metrics:

- Reviews created per week.
- Feedback items per review.
- Percentage of feedback with severity set.
- Percentage of high or blocker items with owners.
- Median time from review open to decision.
- Reviews completed with decision notes.

Quality indicators:

- Fewer unresolved blocker items at decision time.
- More feedback resolved or explicitly deferred.
- Clearer ownership for important feedback.

## Future Directions

- Import comments from GitHub pull requests.
- Import issues from Linear.
- Import annotations from Figma.
- Summarize feedback clusters.
- Suggest severity based on team rules.
- Detect duplicate feedback.
- Track recurring review themes across projects.
- Support organization-specific lenses.
- Add approval policies by review type.

## Open Product Questions

- Should lenses be fixed in MVP or configurable per workspace?
- Should reviews support multiple final approvers?
- Should comments and feedback items be separate concepts?
- Should deferred feedback automatically create follow-up tasks?
- What review types should be first-class: code, design, release, document, or general?
- What source integrations matter most after manual entry works well?

## Initial Milestones

### Milestone 1: Manual Review Workflow

- Review list.
- Create review.
- Review detail.
- Manual feedback entry.
- Severity and status tracking.

### Milestone 2: Triage And Decision

- Feedback ownership.
- Filtering and grouping.
- Decision recording.
- Review summary.

### Milestone 3: Source-Aware Reviews

- Source links.
- Source-specific feedback references.
- Activity history.
- Exportable decision summary.

### Milestone 4: Integrations

- GitHub pull request import.
- Linear issue follow-up.
- Slack notification summaries.

