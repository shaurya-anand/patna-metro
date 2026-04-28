---
name: start
description: Begin-of-session sync routine for patna-metro. Fetches origin, surfaces commits since last local HEAD, reads the durable doc layer (CHANGELOG / open-items / design-rationale / strategy), and outputs a "session starting state" summary. Counterpart to /wrap. Run after /clear, after switching devices, or when picking up the project after a break.
---

# Start — Begin-of-session sync

Use this when the user invokes `/start`, or proactively when:
- Conversation begins fresh and the session-start hook reported new commits on origin
- User mentions they're "starting a new session", "just got back to this", "picking up where we left off"
- The user runs `/clear` followed by a fresh prompt about the project

## Steps

### 1. Sync with origin (read-only by default)

```bash
git fetch --all 2>&1 | tail -5
git status -s
git log --oneline HEAD..origin/main 2>/dev/null
git log --oneline -8
```

After running these:
- If working tree is **clean** AND local is behind origin/main → propose a fast-forward `git merge --ff-only origin/main` (don't run without user nod)
- If working tree is **dirty** → show status; let user decide whether to stash, commit, or revert before pulling
- If local is **ahead** of origin → flag it (local work not yet pushed)

### 2. Read the durable doc layer

Read in this order:

- `docs/CHANGELOG.md` — most recent 3–5 entries (top of file). Latest commits' "why" is the highest-signal context.
- `docs/open-items.md` — full read. Note which items are pending vs done.
- `docs/design-rationale.md` — skim section headings only; deep-read a section if the user's work touches it.
- `docs/strategy.md` — same: skim, deep-read on demand.

### 3. Output the "session starting state" summary

```
## Where we are

Recent commits (last <N> on main):
- <sha> <one-line>
- ...

Open items:
- #<N>: <title> — <brief status>
- ...

Unpushed local commits: <count, or "none">
Working tree: <clean | dirty: M file1, M file2, ...>

Suggested first action: <one specific thing based on what's open>
```

"Suggested first action" should be concrete — the next item from `open-items.md`, an unresolved decision from CHANGELOG, or "no obvious next step, ready for your direction."

### 4. Wait for user direction

Don't preemptively start work after the summary. The summary is the handoff; the user's next message tells you what to do.

## What this skill does NOT do

- Does not auto-pull on dirty working tree — always show status, let user decide.
- Does not push — that's /wrap's job.
- Does not start a new feature — just sync + summarize.
