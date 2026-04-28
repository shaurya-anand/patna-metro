---
name: wrap
description: End-of-session handoff routine for patna-metro. Reconciles the durable doc layer (CHANGELOG, open-items, design-rationale, strategy) against actual session work and writes the updates in a single auto-committed turn. Run before /clear so the next session can pick up cold from docs alone. Use modifier "propose-only" or "dry-run" to preview changes before writing.
---

# Wrap-up — End-of-session doc handoff

Use this when the user invokes `/wrap`, or proactively when:
- The user mentions they're approaching their token limit
- The session has gone long (rough threshold: 100+ messages, heavy code changes)
- The user is about to `/clear` or close the session

## Steps

### 1. Read the durable doc layer

Read in order:

- `docs/CHANGELOG.md` — every commit's "why", reverse-chronological
- `docs/open-items.md` — pending TODOs and deferred work
- `docs/design-rationale.md` — architectural decisions
- `docs/strategy.md` — locked strategy positions

### 2. Inventory this session's work

```bash
git log --oneline origin/main..HEAD 2>/dev/null || git log --oneline -10
git log --oneline --since='12 hours ago'
git status -s
```

### 3. Compare doc state vs. actual work — four passes

**Pass A — this session's gaps:**

- **Commits without CHANGELOG entries.** Every commit should have an entry. If one landed without one, back-fill it (find the sha, write the entry, commit as a "Wrap-up: …" follow-up).
- **Decisions made but not in design-rationale.md.** Skim the conversation for "let's go with X", "decided", "rejected because", "we chose". If a real architectural decision was made, add it.
- **New TODOs raised but not in open-items.md.** Skim for "later", "deferred", "future", "we'll come back to". Each should be a numbered item.
- **Strategy shifts.** If the conversation revisited a position in `strategy.md`, surface what changed.
- **Bugs reported but not yet fixed.** If the user described a bug that's still open, it should be a TODO.

**Pass B — doc-vs-code drift audit:**

For every ⏳ pending item in `open-items.md` and every "Status" or decision line in `strategy.md` / `design-rationale.md`, ask: **does the code agree?** Quick checks:

```bash
# Check if a feature described as pending actually exists in code
grep -rn "<key symbol or function name>" src/ --include="*.jsx" --include="*.js"

# Verify a specific file exists that a doc claims was added
ls src/data/stations.js src/data/graph.js src/data/timeUtils.js 2>/dev/null

# Check if a station was marked operational
grep -n "operational: true" src/data/stations.js
```

If code suggests something is done but the doc says pending → mark DONE in `open-items.md` with the commit sha, update `strategy.md` Status if relevant.

**Pass C — cross-doc consistency:**

- DONE items in `open-items.md` should reference at least one commit sha. Back-fill via `git log --all --oneline -- <file>`.
- CHANGELOG entries for shipped work should mention the open-item number if one exists ("(item #N)").
- `strategy.md` Status sections should reflect current code reality, not historical intent.

**Pass D — open-items bounds check:**

If there are **5 or more** ✅ DONE items in `open-items.md`, archive them:
1. Append to `docs/open-items-archive.md` (create if it doesn't exist).
2. Remove archived items from `open-items.md`, keeping only ⏳ pending items + Status snapshot.
3. Update the Status snapshot with a pointer: `✅ Items #N–#M done → docs/open-items-archive.md`.

### 4. Write + commit (same turn as planning)

**Default mode: auto-write.** Plan updates internally, then write and commit immediately — no propose/approve round-trip. The two-step flow fails if the budget runs out between proposal and write. The commit is the review artifact; `git revert HEAD` undoes the whole wrap cleanly if anything is wrong.

**Exception — propose-only mode.** If the user invokes `/wrap` with `propose-only`, `dry-run`, or `just show me` in their message, switch to the legacy two-step: draft proposed text, ask for approval, write only after explicit "yes / go ahead."

Write order:
1. `docs/CHANGELOG.md` — back-fill any missing entries for this session's commits
2. `docs/open-items.md` — mark items DONE, add new items, update Status snapshot
3. `docs/design-rationale.md` — add new decision sections if any
4. `docs/strategy.md` — update Status lines if anything changed

Commit message:
```
Wrap-up: reconcile docs after session — <one-line summary>
```

Push to main if the session has been pushing.

If budget is tight (user mentions running low or statusline shows >85%), prioritize: (a) CHANGELOG entries for commits this session, (b) item-DONE markers. Skip Pass C cleanups if needed — a partial-but-committed wrap beats a full-but-evaporated one.

### 5. Output the handoff summary

```
## Session ending state

Shipped this session:
- <sha> <one-line>
- ...

Doc updates committed:
- CHANGELOG: <entries added / back-filled>
- open-items: <items marked DONE / new items added>
- strategy: <Status lines updated, if any>
- design-rationale: <new decisions added, if any>

Drift found (Pass B):
- <item that was stale> → <how reconciled>
- (or "none")

Still open:
- #N: <title> — <one-line status>
- ...

Next session: read docs/CHANGELOG.md (most recent entry) then docs/open-items.md.

Working tree is clean. Safe to /clear.
```

## What this skill does NOT do

- Does not write a session transcript dump — the docs are the artifact, not the conversation.
- Does not run `/clear` — that's the user's call after reviewing the handoff.
- Does not push if the session hasn't been pushing — match the session's pattern.
