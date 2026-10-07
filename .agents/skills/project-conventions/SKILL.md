---
name: project-conventions
description: Project-specific conventions for teqfw/email. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The product repository `teqfw/email` and private context repository `flancer32/teqfw-email-ctx`, mounted at `ctx/`, are independent; do not mix status, commits, or pushes.
- Read `ctx/AGENTS.md`, `ctx/docs/filesystem.md`, and relevant product → architecture → environment → code documents before changes.
- Keep `ctx/` ignored by product Git and excluded from npm artifacts.

## Workflow

- Work on `main`. This project rule overrides any GitHub-skill instruction to create a separate branch.
- At the start of work, inspect root and context working trees and upstream state; safely fast-forward local main when an upstream exists and the tree permits it. An empty context remote has no branch to merge.
- Do not commit or push unless the user requests it.
- Run npm/git operations known to require network with `sandbox_permissions: "require_escalated"` from the initial call; keep local read-only Git and npm checks in the sandbox.

## Project-local Skills

- Before reading a local skill, inspect its directory entry with `ls -la` and resolve links with `readlink -f`. Check the target before declaring a mounted skill absent.
- Mount installed package skills with relative links from `.agents/skills/` into `node_modules`; the host owns discovery.

## Communication

Use Russian with the developer and English for source, comments, documentation, identifiers, and commits. Report changes, verification, and remaining risks.

## Package Boundary

The target is an agent-written TeqFW 2.x email plugin using cfg, log, and di 2.x without nodemailer.
The 2.x source is native ESM with frozen __deps__. Preserve direct submission and localized template preparation; legacy 0.x remains on v0.x.
The host owns composition and cfg Sources. Other plugins supply messages; the email package owns submission, not downstream delivery.
Do not copy credentials from the wg reference into documentation, logs, or tests.

## Validation

Use `adsm-ctx validate` for context and `git diff --check` separately in both repositories.
Use `teqfw-platform .` for source/unit-test topology and `teqfw-esm-validator src` for DI module conventions. Use the regular profile for new regular components and the runtime-config profile only for that module pattern.
Run `npm test` and `npm run typecheck` after source changes. Test SMTP using local fixtures; use `npm pack --dry-run` to verify publication boundaries.

## GitHub

Every `gh` command requires `sandbox_permissions: "require_escalated"`; credentials reside in the OS keyring. Do not read, print, export, or replace tokens.
Use actual line breaks in multiline GitHub text, never literal `\n`.

## Shared Memory

`flancer32/ai-memo` is shared cross-project memory; use source identity `teqfw/email` and note path `project/teqfw/email/`.
Every issue must name the project or projects expected to resolve it. Sending issues or comments requires an applicable user instruction.
References to commits in another repository use a full URL: `https://github.com/vendor/name/commit/<sha>`.
