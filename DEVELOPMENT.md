# Git Development Workflow

> Code flows unidirectionally from feature branches into the development branch, keeping commit history linear and clean.

## Branching Model

| Branch | Role | Lifecycle | Description |
|--------|------|-----------|-------------|
| `main` | Primary development | Permanent | Target for new features; upstream sync happens here |
| `<type>/<short-description>` | Feature | Temporary | Checked out from `main`, merged back via PR. See naming convention below |

Branch naming convention: `<type>/<short-description>`

- **type**: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` (aligned with commit types)
- **short-description**: lowercase English, hyphen-separated, 2-5 words

Examples: `feat/huawei-auth`, `fix/startup-crash`, `chore/upgrade-deps`

## Daily Development

```text
<type>/<short-description> ──PR──▶ develop
```

1. Create a feature branch from `main`
2. Regularly sync upstream during development: `git pull --rebase origin main`
3. Submit a PR targeting `main` when development is complete
4. Merge after passing CI and code review

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `chore` | Build, dependencies, configuration |
| `refactor` | Refactoring (no behavior change) |
| `test` | Test-related changes |

Title examples:

```text
feat(arcodex): add dark mode
fix(app): crash on startup
fix: crash on startup
```

Body example (list each change point individually):

```text
feat(arcodex): add user profile page

1. add ProfileView component
2. add /profile route
3. integrate user info API
```

Commit guidelines:

1. **Title**: `<type>(<scope>): <description>`, where scope is the directory name under `packages/` (e.g., `opencode`, `app`, `desktop`). Omit scope for cross-package changes.
2. **Body**: List each change point individually; each item should be an independent, self-contained unit of change.
3. **Granularity**: Each commit should focus on a single logical change. Avoid mixing unrelated modifications.
4. **Language**: English or Chinese are both acceptable; keep language consistent within a single commit.

## PR Checklist

Before submitting a PR, confirm the following:

- [ ] Code passes type checking (run `bun turbo typecheck` from the root, or `bun typecheck` from the package directory)
- [ ] If there are code changes, read the "Documentation Sync Rules" section in [FEATURES-INDEX.md](./specs/FEATURES-INDEX.md) and follow it; skip for documentation-only changes
- [ ] Commits follow the Conventional Commits specification

## Pulling Code

```bash
git pull --rebase
# Or set as default
git config pull.rebase true
```

Avoid meaningless merge commits.
